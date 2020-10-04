const { EventEmitter } = require('events');
const _ = require('lodash');
const { default: config } = require('./config');
const QueueConstructor = require('./Constuructors/QueueConstrucror');
const arena = require('./index');

/**
 * MatchMaking system
 * @module Service/MatchMaking
 * @description Класс обьекта MM, для сбора игр
 * */

/**
 * @typedef {Object} mmObj
 * @property {string} charId
 * @property {number} psr
 * @property {number} startTime
 */

/**
 * Общий класс обьекта MatchMaking
 */
class MatchMaking extends EventEmitter {
  /**
   * Пустой конструктор, предполагается что сам обьект будет 1н
   */
  constructor() {
    super();
    /** @type {QueueConstructor[]} */
    this.allQueue = []; // обьект очередей ! < 10
    /** @type {mmObj[]} */
    this.mmQueue = [];
    this.timerId = undefined;
  }

  checkStatus() {
    const [withClans] = _.partition(this.mmQueue, (mmObj) => arena.characters[mmObj.charId].clan);
    const clans = _.groupBy(withClans, (mmObj) => arena.characters[mmObj.charId].clan.id);
    const isEveryEnemy = Object.values(clans).every((c) => c.length <= this.mmQueue.length / 2);
    return this.mmQueue.length >= config.minPlayersLimit && isEveryEnemy;
  }

  /**
   * Удаление обьекта игрока в очередь поиска
   * @param {String} charId id чара в поиске
   */
  pull(charId) {
    const obj = this.mmQueue.find((el) => el.charId === charId);
    if (obj) {
      this.mmQueue.splice(this.mmQueue.indexOf(obj), 1);
      this.main();
    }
    // @todo убрать просле дебага
    // eslint-disable-next-line no-console
    console.log('MM pull debug', this.mmQueue);
  }

  /**
   * Добавление обьекта игрока в очередь поиска
   * @param {mmObj} obj Обьект запроса поиска {charId,psr,startTime}
   */
  push(obj) {
    this.mmQueue.push(obj);
    this.main();
  }

  /**
   * Функция остановки системы подбора игроков
   * admin only
   */
  stop() {
    clearInterval(this.timerId);
  }

  /**
   * Чистим очередь
   */
  clean() {
    this.allQueue.forEach((queue, i) => {
      if (!queue.open) {
        this.allQueue.splice(i, 1);
      }
    });
  }

  /**
   * Добавляем игроков в комнату
   */
  start() {
    if (!this.allQueue.length) {
      const queue = new QueueConstructor(this.mmQueue.splice(0, config.maxPlayersLimit));
      if (queue.checkStatus()) {
        this.allQueue.push(queue);
        queue.goStartGame();
      }
    }
  }

  /**
   * Запускаем очистку и создаём новую очередь
   */
  cancel() {
    this.clean();
    this.main();
  }

  /**
   * Основная функци работы с очередями
   */
  main() {
    this.stop();
    if (this.checkStatus()) {
      this.timerId = setTimeout(() => { this.start(); }, config.startGameTimeout);
    }
  }

  /**
   * Автоматическая регистрация игрока
   * @param {string} charId
   */
  autoreg(charId) {
    if (arena.characters[charId].autoreg) {
      this.push({
        charId,
        psr: 1000,
        startTime: Date.now(),
      });
    }
  }
}

module.exports = new MatchMaking();
