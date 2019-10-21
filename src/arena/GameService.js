const arena = require('./index');
const BattleLog = require('./BattleLog');
const engineService = require('./engineService');
/**
 * GameService
 *
 * @description Обработка около игровой логики
 * @module Service/Game
 * @todo сейчас после того как Player отлючился, socket выходит из room.
 * Нужен механизм подключения обратно, если клиент "обновил" страницу или
 * переподключился к игре после disconnect(разрыв соединения)
 */
global.arena.games = {};
const RoundService = require('./RoundService');
const PlayersArr = require('./PlayerService');
const OrderService = require('./OrderService');

/**
 * Класс для обьекта игры
 */
class Game {
  /**
   * Конструктор обьекта игры
   *@param {Array} playerArr массив игроков
   */
  constructor(playerArr) {
    this.playerArr = new PlayersArr(playerArr);
    this.players = [];
    this.round = new RoundService();
    this.orders = new OrderService();
    this.battleLog = new BattleLog();
    this.longActions = {};
  }

  /**
   * Функция проверки окончания игры
   */
  get isGameEnd() {
    return Game.aliveArr(this.info.id).length < 2 || this.round.count > 4;
  }

  /**
   * Статик функция возвращающая массив живых игроков в игре
   * @param {Number} gameId идентификатор игры
   * @return {Array} [PlayerObject,PlayerObject,...] массив живых игроков
   */
  static aliveArr(gameId) {
    const game = arena.games[gameId];
    return game.players.filter((player) => player.alive);
  }

  /**
   * Статик функция возвращающая массив живых игроков в игре
   * @param {Number} gameId идентификатор игры
   * @return {String} массив живых игроков
   */
  static randomAlive(gameId) {
    const aliveArr = Game.aliveArr(gameId);
    return aliveArr[Math.random() * aliveArr.length];
  }

  /**
   * Предзагрузка игры
   */
  preLoading() {
    this.info.status = 'preload';
    const self = this;
    const allSockets = this.sockets();
    // eslint-disable-next-line no-console
    console.info(allSockets);
    allSockets.forEach((s) => {
      sails.sockets.join(s, `gameId${self.info.id}`);
    });
    this.sendToAll({
      event: 'preload',
      payload: {
        gameId: this.info.id,
      },
    });
    // помечаем всех игроков что они в игре
    this.info.players.forEach((player) => {
      arena.players[player].mm = self.info.id;
    });

    this.startGame();
    this.initHandlers();
  }

  /**
   * Старт игры
   */
  startGame() {
    // eslint-disable-next-line no-console
    console.debug('GC debug:: startGame', 'gameId:', this.info.id);
    // рассылаем статусы хп команды и врагов
    this.sendToAll({
      event: 'preload',
      payload: {
        gameId: this.info.id,
      },
    });
    this.forAllAlivePlayers(this.sendStatus);
    this.round.nextState();
  }

  /**
   * @description Отправляем event BattleLog все подключенным к игре
   * @param {Object} data Обьект содержащий {event,msg}
   *
   */
  sendBattleLog(data) {
    // eslint-disable-next-line no-console
    console.debug('GC debug:: SBL', 'gameId:', this.info.id, 'data:', data);
    sails.sockets.broadcast(`gameId${this.info.id}`, 'BattleLog', data);
  }

  /**
   * @param {Object} data Обьект содержащий {event,msg}
   */
  sendToAll(data) {
    // eslint-disable-next-line no-console
    console.debug('GC debug:: sendToAll', this.info.id);
    sails.sockets.broadcast(`gameId${this.info.id}`, 'GameEvent', data);
  }

  /**
   *@todo Остановка игры
   */
  pauseGame() {
    // eslint-disable-next-line no-console
    console.debug(this.info.id);
  }

  /**
   * @description Собираем все сокеты в кучу
   * @return {Array} Массив socket's id ['/JXD8vauhvdav','/OIc8934hucahd']
   *
   */
  sockets() {
    return this.info.players.map((charId) => arena.players[charId].socketId);
  }

  /**
   * @description Прекик, помечаем что пользователь не выполнил заказ и дальше
   * будет выброшен
   * @param {String} nick ник игрока который будет помочен как бездействующий
   */
  preKick(nick) {
    const player = this.players[nick];
    // eslint-disable-next-line no-console
    if (!player) return console.log('GC debug:: preKick', nick, 'no player');
    player.isKicked = true;
  }

  /**
   * @description Функция "выброса игрока" из игры,
   * без сохранения накопленных статов
   * @param {String} nick имя персонажа в игре
   */
  kick(nick) {
    const player = this.players[nick];
    // eslint-disable-next-line no-console
    if (!player) return console.log('GC debug:: kick', nick, 'no player');
    this.players.splice(this.players.indexOf(nick), 1);
  }

  /**
   * @description Завершение игры
   *
   */
  endGame() {
    // eslint-disable-next-line no-console
    console.log('GC debug:: endGame', this.info.id);
    this.info.players.forEach((charId) => {
      if (arena.players[charId]) arena.players[charId].mm = false;
    });
    // Отправляем статистику
    this.sendBattleLog(this.statistic());
    // @todo нужно выкидывать из комнаты чата
    this.saveGame();
    setTimeout(() => {
      this.sendToAll({
        event: 'endGame',
        payload: {
          gameId: this.info.id,
        },
      });
    }, 15000);
  }

  /**
   * Создание обьекта в базе // потребуется для ведения истории
   * @return {Object} Обьект созданный в базе
   */
  async createGame() {
    const dbgame = await Games.create({
      players: this.playerArr.init,
    });
    this.players = await this.playerArr.roundJson();
    this.info = dbgame;
    return true;
  }

  /**
   * Возвращает обьект персонажа внутри игры [engine]
   * @param {Number} id идентификатор чара
   * @return {Object} PlayerObj
   */
  getPlayerById(id) {
    return this.players[id];
  }

  /**
   * Сбрасываем всем игрокам кол-во доступных процентов на 100
   */
  resetProc() {
    // eslint-disable-next-line no-param-reassign
    this.players.forEach((player) => {
      player.proc = 100;
    });
  }

  /**
   * Подвес
   */
  initHandlers() {
    // Обработка сообщений от Round Module
    this.round.on('Round', async (data) => {
      switch (data.event) {
        case 'startRound': {
          // eslint-disable-next-line no-console
          console.log('Handler: ', data);
          this.sendToAll(data);
          this.resetProc();
          this.orders.reset();
          this.forAllAlivePlayers(this.sendStatus);
          break;
        }
        case 'endRound': {
          this.sortDead();
          this.refrashPlayer();
          // нужно вызывать готовые функции
          if (this.isGameEnd) {
            this.endGame();
          } else {
            this.round.goNext('starting', 500);
          }
          break;
        }
        case 'engine': {
          this.sendToAll(data);
          await engineService(this);
          break;
        }
        case 'orders': {
          this.sendToAll(data);
          break;
        }
        case 'endOrders': {
          this.sendToAll(data);
          break;
        }
        default: {
          // eslint-disable-next-line no-console
          console.log('InitHandler:', data.event, 'undef event');
        }
      }
    });
    // Обработка сообщений от BattleLog Module
    // @todo пока прокидываем напрямую из battlelog
    this.battleLog.on('BattleLog', async (data) => {
      // eslint-disable-next-line no-console
      console.log('BattleLog:', data);
      this.sendBattleLog(data);
    });
  }

  /**
   * Метод сохраняющий накопленную статистику игроков в базу и сharObj
   * @todo нужен общий метод сохраниющий всю статистику
   */
  saveGame() {
    try {
      const charArr = arena.players;
      this.info.players.forEach((p) => {
        charArr[p].exp += this.players[p].stats.collect.exp;
        charArr[p].gold += this.players[p].stats.collect.gold;
        charArr[p].saveToDb();
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Game:', e);
    }
  }

  /**
   * Функция послематчевой статистики
   * @return {String} возвращает строку статистики по всем игрокам
   */
  statistic() {
    const winners = Game.aliveArr(this.info.id);
    winners.forEach((p) => p.stats.addGold(5));
    let res = `Statistic: Game ${this.info.id} `;
    this.players.forEach((p) => {
      const s = p.stats.collect;
      res += `Player ${p.nick}: exp[${s.exp}] gold[${s.gold}] `;
    });
    return res;
  }

  /**
   * Функция выставляет "смерть" для игроков имеющих hp < 0;
   */
  sortDead() {
    this.players.forEach((p) => {
      if (p.stats.val('hp') <= 0) {
        // eslint-disable-next-line no-param-reassign
        p.alive = false;
      }
    });
  }

  /**
   * Сброс состояния игроков
   */
  refrashPlayer() {
    this.players.forEach((p) => {
      p.stats.refresh();
      p.flags.refresh();
    });
  }

  /**
   * Интерфейс для работы со всеми игроками в игре
   * @param {function} f функция применяющая ко всем игрокам в игре
   */
  forAllPlayers(f) {
    this.players.forEach((p) => f(p));
  }

  /**
   * Интерфейс для работы с живыми
   * @param {function} f функция применяющая
   */
  forAllAlivePlayers(f) {
    const aliveArr = this.players.filter((player) => player.alive);
    aliveArr.forEach((p) => f(p, this));
  }

  /**
   * Рассылка состояний живым игрокам
   * @param {Player} player обьект игрока
   * @param {Game} game обьект игры
   */
  sendStatus(player, game) {
    let team = game.playerArr.getMyTeam(player.clan);
    if (!Object.keys(team).length) {
      team.push(player);
    }
    const enemies = game.playerArr.arr.filter((p) => !team.includes(p));
    team = team.map((p) => {
      if (player.id === p.id) {
        return player;
      }
      return p.getFullStatus();
    });
    enemies.map((p) => p.getStatus());
    player.notify({ enemies, team });
  }
}
module.exports = Game;
