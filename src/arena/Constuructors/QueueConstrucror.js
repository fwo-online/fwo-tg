const { default: config } = require('../config');
const { default: GameService } = require('../GameService');

/**
 * @typedef {Object} mmObj
 * @property {string} charId
 * @property {number} psr
 * @property {number} startTime
 */

/**
 * Конструктор объекта очереди
 */
class QueueConstructor {
  /**
   * Конструтор пустой очереди
   * @param {mmObj[]} searchers
   */
  constructor(searchers) {
    this.psr = 0;
    /** @type {mmObj[]} */
    this.players = searchers;
    this.open = true;
  }

  /**
   * Добавление чара в предсобранную комнату для игры
   * @param {mmObj} searcherObj Объект чара начавшего поиск
   */
  async addTo(searcherObj) {
    try {
      this.players.push(searcherObj);
      if (this.checkStatus()) {
        this.open = false;
        await this.goStartGame();
      }
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Описание политики объекта очереди
   * @param {mmObj} searcherObj
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
    return this.players.length >= config.minPlayersLimit;
  }

  /**
   * Функция создания объекта игры после того как достаточное кол-во игроков,
   * уже найдено в игру.
   */
  async goStartGame() {
    try {
      const newGame = new GameService(this.players.map((pl) => pl.charId));
      await newGame.createGame();
      this.open = false;
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = QueueConstructor;
