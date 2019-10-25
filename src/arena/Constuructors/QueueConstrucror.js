const GameService = require('../GameService');
const WatchService = require('../WatchService');
const { arena: { roundPlayersLimit } } = require('../config');
/**
 * Конструктор обьекта очереди
 */
class QueueConstructor {
  /**
     * Конструтор пустой очереди
     */
  constructor() {
    this.psr = 0;
    this.players = [];
    this.open = true;
  }

  /**
     * Добавление чара в предсобранную комнату для игры
     * @param {Object} searcherObj Обьект чара начавшего поиск
     */
  async addTo(searcherObj) {
    try {
      this.players.push(searcherObj);
      if (this.checkStatus()) {
        this.open = false;
        await this.goStartGame();
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  /**
     * Описание политики обьекта очереди
     * @param {Object} searcherObj
     * @return {Boolean}
     */
  policy(searcherObj) {
    const playerPsr = searcherObj.psr;
    return (!this.length) || (playerPsr > (this.psr / this.length + 50));
  }

  /**
     * Возвращает достигнут ли лимит игроков в очереди
     * @return {Boolean}
     */
  checkStatus() {
    // Проверяем не собралась ли уже у нас очередь ?
    return this.players.length >= roundPlayersLimit;
  }

  /**
     * Функция создания обьекта игры после того как достаточное кол-во игроков,
     * уже найдено в игру.
     */
  async goStartGame() {
    try {
      const newGame = new GameService(this.players.map((pl) => pl.charId));
      await newGame.createGame();
      WatchService.take(newGame);
      this.open = false;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }
}

module.exports = QueueConstructor;
