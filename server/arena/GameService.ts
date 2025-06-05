import { createGame } from '@/api/game';
import type { Game } from '@/models/game';
import type { LongItem } from '@/arena/Constuructors/LongMagicConstructor';
import { engine } from '@/arena/EngineService';
import { HistoryService, type HistoryItem } from '@/arena/HistoryService';
import type * as magics from '@/arena/magics';
import OrderService from '@/arena/OrderService';
import PlayersService, { type Player } from '@/arena/PlayersService';
import { RoundService, RoundStatus } from '@/arena/RoundService';
import arena from '@/arena';
import { mapValues } from 'es-toolkit';
import EventEmitter from 'node:events';
import { type GameStatus, reservedClanName } from '@fwo/shared';

export type KickReason = 'afk' | 'run';

export interface GlobalFlags {
  isEclipsed: { initiator: Player }[];
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
export default class GameService extends EventEmitter<{
  start: [];
  end: [{ reason: string | undefined }];
  startOrders: [];
  endOrders: [];
  preKick: [{ reason: string; player: Player }];
  kick: [{ reason: string; player: Player }];
  startRound: [{ round: number; status: Record<string, GameStatus[]> }];
  endRound: [{ dead: Player[]; log: HistoryItem[] }];
}> {
  players: PlayersService;
  orders: OrderService;
  round = new RoundService();
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
    super();

    this.players = new PlayersService(players);
    this.orders = new OrderService(this.players, this.round);
    this.flags = {
      noDamageRound: 0,
      global: {
        isEclipsed: [],
      },
    };
  }

  /**
   * Функция проверки окончания игры
   */
  get isGameEnd(): boolean {
    return (
      this.isTeamWin ||
      this.players.alivePlayers.length === 0 ||
      this.flags.noDamageRound > 2 ||
      this.round.count > 9
    );
  }

  get isTeamWin(): boolean {
    const { [reservedClanName]: noClan, ...groupByClan } = this.players.groupByClan(
      this.players.alivePlayers,
    );
    if (!noClan?.length) {
      return Object.keys(groupByClan).length === 1;
    }
    return noClan.length === 1 && !Object.keys(groupByClan).length;
  }

  getEndGameReason() {
    if (this.flags.noDamageRound > 2) {
      return 'noDamageRound';
    }
  }

  get checkRoundDamage(): boolean {
    return !!this.history.hasDamageForRound(this.round.count);
  }

  /**
   * Предзагрузка игры
   */
  preLoading(): void {
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
    this.round.initRound();
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
      console.debug('GC debug:: preKick', id, 'no player');
      return;
    }
    player.preKick(reason);
    this.emit('preKick', { reason, player });
  }

  /**
   * Функция "выброса игрока" из игры без сохранения накопленных статов
   * @param id id игрока, который будет выброшен
   * @param reason причина кика
   */
  kick(id: string, reason: KickReason): void {
    const player = this.players.getById(id);
    if (!player) {
      console.debug('GC debug:: kick', id, 'no player');
      return;
    }

    this.emit('kick', { reason, player });

    const char = arena.characters[id];
    void char.performance.addGameRun();
    char.autoreg = false;
    this.players.kick(id);
    this.info.players.splice(this.info.players.indexOf(id), 1);
    this.cleanLongMagics();
    this.resetGameIds([player]);
  }

  checkRun(player: Player) {
    if (player.flags.isKicked === 'run') {
      this.kick(player.id, player.flags.isKicked);
      return;
    }
  }

  /**
   * Проверяем делал ли игрок заказ. Помечает isKicked, если нет
   * @param player
   */
  checkOrders(player: Player): void {
    if (!player.alive || this.round.count === 1) {
      return;
    }

    if (!this.orders.checkPlayerOrderLastRound(player.id)) {
      if (player.flags.isKicked === 'afk') {
        this.kick(player.id, 'afk');
      } else {
        this.preKick(player.id, 'afk');
      }
    } else {
      /** @todo create clear kick flag method */
      player.preKick(undefined);
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

  getLastRoundResults() {
    return this.history.getHistoryForRound(this.round.count - 1);
  }

  getRoundResults() {
    return this.history.getHistoryForRound(this.round.count);
  }

  /**
   * @description Завершение игры
   *
   */
  endGame(): void {
    console.debug('GC debug:: endGame', this.info.id);
    // Отправляем статистику
    setTimeout(async () => {
      this.resetGameIds(this.players.players);

      this.emit('end', { reason: this.getEndGameReason() });
      this.removeAllListeners();

      arena.mm.cancel();
    }, 1000);
  }

  /**
   * Создание объекта в базе // потребуется для ведения истории
   * @return Объект созданный в базе
   */
  async createGame() {
    try {
      const dbGame = await createGame(this.players.init);
      this.info = dbGame;
      this.info.id = this.info._id.toString();
      return this;
    } catch (e) {
      console.debug('GC debug:: createGame', e);
    } finally {
      this.preLoading();
    }
  }

  /**
   * Очищаем глобальные флаги в бою
   * затмение, бунт богов, и т.п
   */
  refreshRoundFlags(): void {
    this.flags.global.isEclipsed = [];
  }

  /**
   * Подвес
   */
  initHandlers(): void {
    // Обработка сообщений от Round Module
    this.round.subscribe(({ state, round }) => {
      switch (state) {
        case RoundStatus.INIT: {
          this.emit('start');
          break;
        }
        case RoundStatus.START_ROUND: {
          this.forAllPlayers(this.checkOrders);
          this.sendStatus(round);
          break;
        }
        case RoundStatus.END_ROUND: {
          this.forAllPlayers(this.checkRun);
          this.emit('endRound', { dead: this.sortDead(), log: this.getRoundResults() });
          this.players.reset();
          this.orders.reset();
          this.handleEndGameFlags();
          if (this.isGameEnd) {
            this.round.unsubscribe();
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
          this.emit('startOrders');
          break;
        }
        case RoundStatus.END_ORDERS: {
          this.emit('endOrders');
          break;
        }
        default: {
          console.log('InitHandler:', state, 'undef event');
        }
      }
    });
  }

  resetGameIds(players: Player[]) {
    players.forEach(({ id }) => {
      arena.characters[id].gameId = '';
    });
  }

  /**
   * Функция выставляет "смерть" для игроков имеющих hp < 0;
   * Отсылает сообщение о смерти игрока в последнем раунде
   * @todo сообщение о смерти как-то нормально нужно сделать,
   * чтобы выводило от чего и от кого умер игрок
   */
  sortDead() {
    const dead = this.players.sortDead();
    this.resetGameIds(dead);
    this.cleanLongMagics();
    return dead;
  }

  /**
   * Очистка массива длительных магий от умерших
   */
  cleanLongMagics(): void {
    this.longActions = mapValues(this.longActions, (longMagicType) => {
      return longMagicType?.filter((act) => {
        return this.players.getById(act.target)?.alive;
      });
    });
  }

  /**
   * Интерфейс для работы со всеми игроками в игре
   * @param f функция применяющая ко всем игрокам в игре
   */
  forAllPlayers(f: (player: Player) => void): void {
    this.players.players.forEach((p) => f.call(this, p));
  }

  getStatus() {
    const playersByClan = this.players.groupByClan();

    return mapValues(playersByClan, (players = []) => {
      return players.map((p) => p.getStatus());
    });
  }

  /**
   * Рассылка состояний живым игрокам
   */
  sendStatus(round: number): void {
    const status = this.getStatus();

    this.emit('startRound', { round, status });
  }
}
