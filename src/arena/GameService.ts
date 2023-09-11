import _ from 'lodash';
import { createGame } from '@/api/game';
import { Profs } from '../data';
import * as channelHelper from '../helpers/channelHelper';
import type { Game } from '../models/game';
import type { LongItem } from './Constuructors/LongMagicConstructor';
import { engine } from './engineService';
import { HistoryService, type HistoryItem } from './HistoryService';
import { LogService } from './LogService';
import type * as magics from './magics';
import OrderService from './OrderService';
import PlayersService, { type Player } from './PlayersService';
import { RoundService, RoundStatus } from './RoundService';
import testGame from './testGame';
import arena from './index';

export type KickReason = 'afk' | 'run';

export interface GlobalFlags {
  isEclipsed?: boolean;
}

/**
 * GameService
 *
 * @description Обработка около игровой логики
 * @module Service/Game
 * @todo сейчас после того как Player отключился, socket выходит из room.
 * Нужен механизм подключения обратно, если клиент "обновил" страницу или
 * переподключился к игре после disconnect(разрыв соединения)
 */

/**
 * Класс для объекта игры
 */
export default class GameService {
  players: PlayersService;
  round = new RoundService();
  orders = new OrderService();
  logger = new LogService();
  history = new HistoryService();
  longActions: Partial<Record<keyof typeof magics, LongItem[]>> = {};
  info!: Game;
  flags: {
    noDamageRound: number;
    global: GlobalFlags;
  };

  /**
   * Конструктор объекта игры
   * @param players массив игроков
   */
  constructor(players: string[]) {
    this.players = new PlayersService(players);
    this.flags = {
      noDamageRound: 0,
      global: {},
    };
  }

  /**
   * Функция проверки окончания игры
   */
  get isGameEnd(): boolean {
    return (
      this.isTeamWin
      || this.players.alivePlayers.length === 0
      || this.flags.noDamageRound > 2
      || this.round.count > 9
    );
  }

  get isTeamWin(): boolean {
    const { withClan, withoutClan, groupByClan } = this.players.partitionAliveByClan;
    if (!withoutClan.length) {
      return Object.keys(groupByClan).length === 1;
    }
    return withoutClan.length === 1 && !withClan.length;
  }

  get endGameReason(): string {
    const base = 'Игра завершена.';
    if (this.flags.noDamageRound > 2) {
      return `${base} Причина: 3 раунда подряд никто из участников не наносил урона`;
    }
    return base;
  }

  get checkRoundDamage(): boolean {
    return !!this.history.hasDamageForRound(this.round.count);
  }

  /**
   * Проверяет являются ли игроки союзниками
   * @param player
   * @param target
   */
  isPlayersAlly(player: Player, target: Player): boolean {
    const allies = this.players.getMyTeam(player.id);
    if (!allies.length) {
      return player.id === target.id;
    }
    return allies.some((ally) => ally.id === target.id);
  }

  /**
   * Предзагрузка игры
   */
  preLoading(): void {
    this.forAllAlivePlayers(channelHelper.removeMessages);
    this.initHandlers();
    this.startGame();

    arena.games[this.info.id] = this;

    this.info.players.forEach((playerId) => {
      arena.characters[playerId].gameId = this.info.id;
    });
    // @todo add statistic +1 game for all players
  }

  /**
   * Старт игры
   */
  startGame(): void {
    console.debug('GC debug:: startGame', 'gameId:', this.info.id);
    // рассылаем статусы хп команды и врагов
    this.sendToAll('Игра начинается');
    this.round.initRound();
  }

  /**
   * @description Отправляем event BattleLog все подключенным к игре
   * @param data строка, отправляемая в общий чат
   *
   */
  sendBattleLog(data: string): void {
    console.debug('GC debug:: SBL', 'gameId:', this.info.id, 'data:', data);
    void channelHelper.broadcast(data);
  }

  /**
   * @param data строка, отправляемая в общий чат
   */
  sendToAll(data: string): void {
    console.debug('GC debug:: sendToAll', this.info.id);
    void channelHelper.broadcast(data);
  }

  /**
   *@todo Остановка игры
   */
  pauseGame(): void {
    console.debug(this.info.id);
  }

  /**
   * Прекик, помечаем что пользователь не выполнил заказ и дальше будет выброшен
   * @param id id игрока, который будет помочен как бездействующий
   * @param reason строка, подставляющаяся в флаг isKicked
   */
  preKick(id: string, reason: KickReason): void {
    const player = this.players.getById(id);
    if (!player) {
      return console.log('GC debug:: preKick', id, 'no player');
    }
    player.preKick(reason);
  }

  /**
   * Функция "выброса игрока" из игры без сохранения накопленных статов
   * @param id id игрока, который будет выброшен
   * @param reason причина кика
   */
  kick(id: string, reason?: KickReason): void {
    const player = this.players.getById(id);
    if (!player) {
      console.log('GC debug:: kick', id, 'no player');
      return;
    }
    void channelHelper.sendRunButton(player);
    if (reason === 'run') {
      void channelHelper.broadcast(`Игрок *${player.nick}* сбежал из боя`);
    } else {
      void channelHelper.broadcast(`Игрок *${player.nick}* был выброшен из игры`);
    }
    const char = arena.characters[id];
    char.addGameStat({ runs: 1 });
    void char.saveToDb();
    char.autoreg = false;
    this.players.kick(id);
    this.info.players.splice(this.info.players.indexOf(id), 1);
  }

  /**
   * Проверяем делал ли игрок заказ. Помечает isKicked, если нет
   * @param player
   */
  checkOrders(player: Player): void {
    if (!player.alive) {
      return;
    }

    if (player.flags.isKicked === 'run') {
      this.kick(player.id, player.flags.isKicked);
      return;
    }

    if (player.flags.isKicked === 'afk' && !this.orders.checkPlayerOrder(player.id)) {
      this.kick(player.id, player.flags.isKicked);
    } else {
      player.preKick(this.orders.checkPlayerOrder(player.id) ? undefined : 'afk');
    }
  }

  /**
   * Ставим флаги, влияющие на окончание игры
   */
  handleEndGameFlags(): void {
    if (this.checkRoundDamage) {
      this.flags.noDamageRound = 0;
    } else {
      this.flags.noDamageRound += 1;
    }
  }

  recordOrderResult(item: HistoryItem) {
    this.history.addHistoryForRound(item, this.round.count);
  }

  getRoundResults() {
    return this.history.getHistoryForRound(this.round.count);
  }

  /**
   * @description Завершение игры
   *
   */
  endGame(): void {
    console.log('GC debug:: endGame', this.info.id);
    // Отправляем статистику
    this.sendBattleLog(this.endGameReason);
    this.sendBattleLog(this.statistic());
    this.saveGame();
    setTimeout(() => {
      this.sendToAll('Конец игры, распределяем ресурсы...');
      this.forAllPlayers(channelHelper.sendExitButton);
      this.forAllPlayers((player: Player) => { arena.characters[player.id].gameId = ''; });
      arena.mm.cancel();
      this.forAllPlayers((player: Player) => {
        const char = arena.characters[player.id];
        if (char.expEarnedToday >= char.expLimitToday) {
          char.autoreg = false;
        }
        if (!char.autoreg) return;
        arena.mm.push({
          charId: player.id,
          psr: 1000,
          startTime: Date.now(),
        });
      });
    }, 15000);
  }

  /**
   * Создание объекта в базе // потребуется для ведения истории
   * @return Объект созданный в базе
   */
  async createGame(): Promise<boolean> {
    const dbGame = await createGame(this.players.init);
    this.info = dbGame;
    this.info.id = this.info._id.toString();
    this.preLoading();
    return true;
  }

  /**
  * Очищаем глобальные флаги в бою
  * затмение, бунт богов, и т.п
  */
  refreshRoundFlags(): void {
    this.flags.global = {};
  }

  async sendMessages(messages: HistoryItem[]): Promise<void> {
    console.log(messages);
    await this.logger.sendBattleLog(messages);
  }

  /**
   * Подвес
   */
  initHandlers(): void {
    // Обработка сообщений от Round Module
    this.round.subscribe((data) => {
      switch (data.state) {
        case RoundStatus.START_ROUND: {
          this.sendToAll(`⚡️ Раунд ${data.round} начинается ⚡`);
          this.forAllAlivePlayers(this.sendStatus);
          break;
        }
        case RoundStatus.END_ROUND: {
          void this.sendMessages(this.getRoundResults());
          this.sortDead();
          this.players.reset();
          this.orders.reset();
          this.handleEndGameFlags();
          if (this.isGameEnd) {
            this.endGame();
          } else {
            this.refreshRoundFlags();
            this.round.nextRound();
          }
          break;
        }
        case RoundStatus.ENGINE: {
          engine(this);
          break;
        }
        case RoundStatus.START_ORDERS: {
          void channelHelper.broadcast('Пришло время делать заказы!');
          this.forAllAlivePlayers(channelHelper.sendOrderButtons);
          break;
        }
        case RoundStatus.END_ORDERS: {
          this.forAllAlivePlayers(channelHelper.removeMessages);
          // Debug Game Hack
          if (process.env.NODE_ENV === 'development') {
            this.orders.ordersList = this.orders.ordersList.concat(testGame.orders);
          }
          this.forAllPlayers(this.checkOrders);
          break;
        }
        default: {
          console.log('InitHandler:', data.state, 'undef event');
        }
      }
    });
  }

  /**
   * Метод сохраняющий накопленную статистику игроков в базу и сharObj
   * @todo нужен общий метод сохраняющий всю статистику
   */
  saveGame(): void {
    try {
      _.forEach(this.info.players, async (id) => {
        const player = this.players.getById(id);
        if (!player) {
          return;
        }
        arena.characters[id].exp += player.stats.collect.exp;
        arena.characters[id].expEarnedToday += player.stats.collect.exp;
        arena.characters[id].gold += player.stats.collect.gold;

        const kills = this.players.getKills(id).length;
        const death = player.alive ? 0 : 1;

        arena.characters[id].addGameStat({
          games: 1,
          death,
          kills,
        });
        await arena.characters[id].saveToDb();
      });
    } catch (e) {
      console.log('Game:', e);
    }
  }

  /**
   * Функция послематчевой статистики
   * @return возвращает строку статистики по всем игрокам
   */
  statistic(): string {
    this.giveGoldforKill();
    const winners = this.players.alivePlayers;
    const gold = this.players.deadPlayers.length ? 5 : 1;
    winners.forEach((p) => p.stats.addGold(gold));

    const { withoutClan, groupByClan } = this.players.partitionByClan;

    const getStatusString = (p: Player) => `\t👤 ${p.nick} получает ${p.stats.collect.exp}📖 и ${p.stats.collect.gold}💰`;

    const playersWithoutClan = withoutClan.map(getStatusString);
    const playersWithClan = _.map(groupByClan, (players, clan) => `${clan}\n${players.map(getStatusString).join('\n')}`);

    return [
      '*Статистика игры*```',
      playersWithClan.length && playersWithClan.join('\n\n'),
      playersWithoutClan.length && playersWithoutClan.join('\n'),
      '```',
    ].filter((x) => x).join('\n\n');
  }

  /**
  * Функция пробегает всех убитых и раздает золото убийцам
  */
  giveGoldforKill(): void {
    this.players.deadPlayers.forEach((p) => {
      const killer = this.players.getById(p.getKiller());
      if (killer && killer.id !== p.id) {
        killer.stats.addGold(5 * p.lvl);
      }
    });
  }

  /**
   * Функция выставляет "смерть" для игроков имеющих hp < 0;
   * Отсылает сообщение о смерти игрока в последнем раунде
   * @todo сообщение о смерти как-то нормально нужно сделать,
   * чтобы выводило от чего и от кого умер игрок
   */
  sortDead(): void {
    const dead = this.players.sortDead();
    this.cleanLongMagics();
    if (dead.length) {
      this.sendToAll(`Погибши${
        dead.length === 1 ? 'й' : 'е'
      } в этом раунде: ${
        dead.map(({ nick }) => nick).join(', ')
      }`);
    }
  }

  /**
  * Очистка массива длительных магий от умерших
  */
  cleanLongMagics(): void {
    /**
    * Очищаем массив длительных магий для мертвецов
{
    frostTouch: [
    {
      initiator: '5ea330784e5f0354f04edcec',
      target: '5e05ee58bdf83c6a5ff3f8dd',
      duration: 0,
      round: 1,
      proc: 1
    }
  ]
}
    */
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    _.forEach(this.longActions, (longMagicType, k) => {
      _this.longActions[k] = _.filter(longMagicType, (act) => {
        const p = _this.players.getById(act.target);
        return p?.alive;
      });
    });
    this.longActions = _this.longActions;
  }

  /**
   * Интерфейс для работы со всеми игроками в игре
   * @param f функция применяющая ко всем игрокам в игре
   */
  forAllPlayers(f: (player: Player) => void): void {
    this.players.players.forEach((p) => f.call(this, p));
  }

  /**
   * Интерфейс для работы с живыми
   * @param f функция применяющая ко всем живым игрокам
   */
  forAllAlivePlayers(f: (player: Player) => void): void {
    this.players.alivePlayers.forEach((p) => f.call(this, p));
  }

  /**
   * Рассылка состояний живым игрокам
   * @param player объект игрока
   */
  sendStatus(player: Player): void {
    const getEnemyString = (p: Player) => `\t👤 ${p.nick} (${Profs.profsData[p.prof].icon}${p.lvl}) ❤️${p.getStatus().hp}`;

    const { withoutClan, groupByClan } = this.players.partitionAliveByClan;

    let team: Player[];
    if (player.clan) {
      team = groupByClan[player.clan.name];
      delete groupByClan[player.clan.name];
    } else {
      team = [player];
      const index = withoutClan.findIndex((p) => p.id === player.id);
      withoutClan.splice(index, 1);
    }

    const allies = team.map((p) => {
      const status = p.getFullStatus();
      if (p.prof === 'l' || p.prof === 'w') {
        return `\t👤 ${p.nick} (${Profs.profsData[p.prof].icon}${p.lvl}) ❤️${status.hp} 🔋${status.en}`;
      }
      return `\t👤 ${p.nick} (${Profs.profsData[p.prof].icon}${p.lvl}) ❤️${status.hp}  \n\t💧${status.mp}  🔋${status.en}`;
    });

    const enemiesWithoutClan = withoutClan.map(getEnemyString);
    const enemiesWithClan = _.map(groupByClan, (players, clan) => `_${clan}_\n${players.map(getEnemyString).join('\n')}`);

    void channelHelper.sendStatus(
      [`*Раунд ${this.round.count}*

_Союзники:_\`\`\`

${allies.join('\n')}\`\`\`

_Враги:_\`\`\``,
      enemiesWithClan.length && enemiesWithClan.join('\n\n'),
      enemiesWithoutClan.length && `${enemiesWithoutClan.join('\n')}`,
      '```'].filter((x) => x).join('\n\n'),
      player.tgId,
    );
  }
}
