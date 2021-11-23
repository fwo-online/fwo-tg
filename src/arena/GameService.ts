import _ from 'lodash';
import { Profs } from '../data';
import * as channelHelper from '../helpers/channelHelper';
import { BattleLog } from './BattleLog';
import type { LongItem } from './Constuructors/LongMagicConstructor';
import { engine } from './engineService';
import HistoryService, { historyObj } from './HistoryService';
import type * as magics from './magics';
import OrderService from './OrderService';
import PlayersArr from './playerArray';
import type Player from './PlayerService';
import { RoundService, RoundStatus } from './RoundService';
import testGame from './testGame';
import arena from './index';
import { createGame, Game as LeanGame } from '@/models/game/api';

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
export default class Game {
  playerArr: PlayersArr;
  players: Record<string, Player> = {};
  round = new RoundService();
  orders = new OrderService();
  battleLog = new BattleLog();
  history = new HistoryService();
  longActions: Partial<Record<keyof typeof magics, LongItem[]>> = {};
  info!: LeanGame;
  flags: {
    noDamageRound: number;
    global: GlobalFlags;
  }
  /**
   * Конструктор объекта игры
   * @param playerArr массив игроков
   */
  constructor(playerArr: string[]) {
    this.playerArr = new PlayersArr(playerArr);
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
      || this.alivePlayers.length === 0
      || this.flags.noDamageRound > 2
      || this.round.count > 9
    );
  }

  get isTeamWin(): boolean {
    const [withClan, withoutClan, byClan] = this.partitionAliveByClan;
    if (!withoutClan.length) {
      return Object.keys(byClan).length === 1;
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

  /**
   * Возвращает массив мёртвых игроков
   */
  get deadPlayers(): Player[] {
    return _.filter(this.players, {
      alive: false,
    });
  }

  /**
   * Возвращает массив живых игроков
   */
  get alivePlayers(): Player[] {
    return _.filter(this.players, {
      alive: true,
    });
  }

  get checkRoundDamage(): boolean {
    return !!this.history.getRoundDamage(this.round.count).length;
  }

  /**
   * Статик функция возвращающая массив живых игроков в игре
   * @param gameId идентификатор игры
   * @return массив живых игроков
   */
  static aliveArr(gameId: string): Player[] {
    const game = arena.games[gameId];
    return _.filter(game.players, {
      alive: true,
    });
  }

  /**
   * Отправляет в чат кнопки с заказами
   * @param player - объект игрока
   */
  static showOrderButtons(player: Player): void {
    channelHelper.sendOrderButtons(player);
  }

  /**
   * Удаляет кнопки заказа в чате
   * @param player - объект игрока
   */
  static hideLastMessage(player: Player): void {
    channelHelper.removeMessages(player);
  }

  /**
   * Отправляет в чат кнопки с заказами
   * @param player - объект игрока
   */
  static showExitButton(player: Player): void {
    channelHelper.sendExitButton(player);
  }

  /**
   * Проверяет являются ли игроки союзниками
   * @param player
   * @param target
   */
  isPlayersAlly(player: Player, target: Player): boolean {
    const allies = this.playerArr.getMyTeam(player);
    if (!allies.length) {
      allies.push(player);
    }
    return allies.some((ally) => ally.id === target.id);
  }

  /**
   * Предзагрузка игры
   */
  preLoading(): void {
    this.forAllAlivePlayers(Game.hideLastMessage);
    this.initHandlers();
    this.startGame();

    arena.games[this.info.id] = this;

    this.info.players.forEach((id) => {
      arena.characters[id].gameId = this.info.id;
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
    channelHelper.broadcast(data);
  }

  /**
   * @param data строка, отправляемая в общий чат
   */
  sendToAll(data: string): void {
    console.debug('GC debug:: sendToAll', this.info.id);
    channelHelper.broadcast(data);
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
    const player = this.players[id];
    if (!player) return console.log('GC debug:: preKick', id, 'no player');
    player.flags.isKicked = reason;
  }

  /**
   * Функция "выброса игрока" из игры без сохранения накопленных статов
   * @param id id игрока, который будет выброшен
   * @param reason причина кика
   */
  kick(id: string, reason?: KickReason): void {
    const player = this.players[id];
    if (!player) return console.log('GC debug:: kick', id, 'no player');
    channelHelper.sendRunButton(player);
    if (reason === 'run') {
      channelHelper.broadcast(`Игрок *${player.nick}* сбежал из боя`);
    } else {
      channelHelper.broadcast(`Игрок *${player.nick}* был выброшен из игры`);
    }
    const char = arena.characters[id];
    char.addGameStat({ runs: 1 });
    char.saveToDb();
    char.autoreg = false;
    delete this.players[id];
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
      player.flags.isKicked = this.orders.checkPlayerOrder(player.id) ? undefined : 'afk';
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

  addHistoryDamage(dmgObj: Omit<historyObj, 'round'>): void {
    this.history.addDamage({
      ...dmgObj,
      round: this.round.count,
    });
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
      this.forAllPlayers(Game.showExitButton);
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
  async createGame(): Promise<void> {
    const dbGame = await createGame({
      players: this.playerArr.init,
    });
    if (!dbGame) {
      throw new Error('game was not found');
    }
    this.players = await this.playerArr.roundJson();
    this.info = dbGame;
    this.info.id = this.info._id;
    this.preLoading();
  }

  /**
   * Возвращает объект персонажа внутри игры [engine]
   * @param id идентификатор чара
   * @return PlayerObj
   */
  getPlayerById(id: string): Player {
    return this.players[id];
  }

  /**
   * Сбрасываем всем игрокам кол-во доступных процентов на 100
   */
  resetProc(): void {
    _.forEach(this.players, (p) => { p.proc = 100; });
  }

  /**
  * Очищаем глобальные флаги в бою
  * затмение, бунт богов, и т.п
  */
  refreshRoundFlags(): void {
    this.flags.global = {};
  }

  async sendMessages(): Promise<void> {
    const messages = this.battleLog.getMessages();
    const promises = messages.map(this.sendBattleLog.bind(this));
    await Promise.all(promises);
    this.battleLog.clearMessages();
  }

  /**
   * Подвес
   */
  initHandlers(): void {
    // Обработка сообщений от Round Module
    this.round.subscribe(async (data) => {
      switch (data.state) {
        case RoundStatus.START_ROUND: {
          this.sendToAll(`⚡️ Раунд ${data.round} начинается ⚡`);
          this.resetProc();
          this.orders.reset();
          this.forAllPlayers(this.sendStatus);
          break;
        }
        case RoundStatus.END_ROUND: {
          await this.sendMessages();
          this.sortDead();
          this.handleEndGameFlags();
          this.refreshPlayer();
          if (this.isGameEnd) {
            this.endGame();
          } else {
            this.refreshRoundFlags();
            this.round.nextRound();
          }
          break;
        }
        case RoundStatus.ENGINE: {
          await engine(this);
          break;
        }
        case RoundStatus.START_ORDERS: {
          channelHelper.broadcast('Пришло время делать заказы!');
          this.forAllAlivePlayers(Game.showOrderButtons);
          break;
        }
        case RoundStatus.END_ORDERS: {
          this.forAllAlivePlayers(Game.hideLastMessage);
          // Debug Game Hack
          if (this.players['5e05ee58bdf83c6a5ff3f8dd']) {
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
    // Обработка сообщений от BattleLog Module
    // @todo пока прокидываем напрямую из battlelog
    this.battleLog.on('BattleLog', (data) => {
      console.log('BattleLog:', data);
      this.sendBattleLog(data);
    });
  }

  /**
   * Метод сохраняющий накопленную статистику игроков в базу и сharObj
   * @todo нужен общий метод сохраняющий всю статистику
   */
  saveGame(): void {
    try {
      _.forEach(this.info.players, async (id) => {
        arena.characters[id].exp += this.players[id].stats.collect.exp;
        arena.characters[id].expEarnedToday += this.players[id].stats.collect.exp;
        arena.characters[id].gold += this.players[id].stats.collect.gold;

        const kills = Object.values(this.players)
          .reduce((sum, player) => (player.getKiller() === id ? sum + 1 : sum), 0);

        const death = this.players[id].alive ? 0 : 1;

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
   * @returns [withClan, withoutClan, groupByClan]
   */
  get partitionByClan(): [Player[], Player[], _.Dictionary<Player[]>] {
    const [withClan, withoutClan] = _.partition(this.playerArr.arr, (p) => p.clan);
    const groupByClan = _.groupBy(withClan, (p) => p.clan?.name);
    return [withClan, withoutClan, groupByClan];
  }

  /**
   * @returns [withClan, withoutClan, groupByClan]
   */
  get partitionAliveByClan(): [Player[], Player[], _.Dictionary<Player[]>] {
    const [withClan, withoutClan] = _.partition(this.alivePlayers, (p) => p.clan);
    const groupByClan = _.groupBy(withClan, (p) => p.clan?.name);
    return [withClan, withoutClan, groupByClan];
  }

  /**
   * Функция послематчевой статистики
   * @return возвращает строку статистики по всем игрокам
   */
  statistic(): string {
    this.giveGoldforKill();
    const winners = this.alivePlayers;
    const gold = this.deadPlayers.length ? 5 : 1;
    winners.forEach((p) => p.stats.addGold(gold));

    const [, withoutClan, byClan] = this.partitionByClan;

    const getStatusString = (p: Player) => `\t👤 ${p.nick} получает ${p.stats.collect.exp}📖 и ${p.stats.collect.gold}💰`;

    const playersWithoutClan = withoutClan.map(getStatusString);
    const playersWithClan = _.map(byClan, (players, clan) => `${clan}\n${players.map(getStatusString).join('\n')}`);

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
    const deadArray = this.deadPlayers;
    _.forEach(deadArray, (p) => {
      const killer = this.getPlayerById(p.getKiller());
      if (killer && killer.id !== p.id) killer.stats.addGold(5 * p.lvl);
    });
  }

  /**
   * Функция выставляет "смерть" для игроков имеющих hp < 0;
   * Отсылает сообщение о смерти игрока в последнем раунде
   * @todo сообщение о смерти как-то нормально нужно сделать,
   * чтобы выводило от чего и от кого умер игрок
   */
  sortDead(): void {
    const dead: string[] = [];
    _.forEach(this.players, (p) => {
      if (p.stats.val('hp') <= 0 && p.alive) {
        dead.push(p.nick);
        p.alive = false;
      }
    });
    this.cleanLongMagics();
    if (dead.length) {
      this.sendToAll(`Погибши${
        dead.length === 1 ? 'й' : 'е'
      } в этом раунде: ${
        dead.join(', ')
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
        const p = _this.getPlayerById(act.target) || {};
        return p.alive;
      });
    });
    this.longActions = _this.longActions;
  }

  /**
   * Сброс состояния игроков
   */
  refreshPlayer(): void {
    _.forEach(this.players, (p) => {
      p.stats.refresh();
      p.flags.refresh();
    });
  }

  /**
   * Интерфейс для работы со всеми игроками в игре
   * @param f функция применяющая ко всем игрокам в игре
   */
  forAllPlayers(f: (player: Player) => void): void {
    _.forEach(this.players, (p) => f.call(this, p));
  }

  /**
   * Интерфейс для работы с живыми
   * @param f функция применяющая ко всем живым игрокам
   */
  forAllAlivePlayers(f: (player: Player) => void): void {
    this.alivePlayers.forEach((p) => f.call(this, p));
  }

  /**
   * Рассылка состояний живым игрокам
   * @param player объект игрока
   */
  sendStatus(player: Player): void {
    const getEnemyString = (p: Player) => `\t👤 ${p.nick} (${Profs.profsData[p.prof].icon}${p.lvl}) ❤️${p.getStatus().hp}`;

    const [, withoutClan, byClan] = this.partitionAliveByClan;

    let team;
    if (player.clan) {
      team = player.clan ? byClan[player.clan.name] : [player];
      delete byClan[player.clan.name];
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
    const enemiesWithClan = _.map(byClan, (players, clan) => `_${clan}_\n${players.map(getEnemyString).join('\n')}`);

    channelHelper.sendStatus(
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
