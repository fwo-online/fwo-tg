const { default: config } = require('../config');
const { default: GameService } = require('../GameService');

/**
 * @typedef {Object} mmObj
 * @property {string} charId
 * @property {number} psr
 * @property {number} startTime
 */

/**
 * Конструктор обьекта очереди
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
   * @param {mmObj} searcherObj Обьект чара начавшего поиск
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
   * Функция создания обьекта игры после того как достаточное кол-во игроков,
   * уже найдено в игру.
   */
  async goStartGame() {
    try {
      const newGame = new GameService(this.players.map((pl) => pl.charId));
      await newGame.createGame();
      this.open = false;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }
}

module.exports = QueueConstructor;
