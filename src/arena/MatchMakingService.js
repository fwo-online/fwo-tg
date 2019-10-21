const { EventEmitter } = require('events');
const { maxIter } = require('./config');
const QueueConstructor = require('./Constuructors/QueueConstrucror');

/**
 * MatchMaking system
 * @module Service/MatchMaking
 * @description Класс обьекта MM, для сбора игр
 * */

/**
 * Общий класс обьекта MatchMaking
 */
class MatchMaking extends EventEmitter {
  /**
   * Пустой конструктор, предполагается что сам обьект будет 1н
   */
  constructor() {
    super();
    this.allQueue = []; // обьект очередей ! < 10
    this.mmQueue = [];
    this.prefs = {
      checkinterval: 10000,
    };
    this.timerId = undefined;
  }

  /**
   * Удаление обьекта игрока в очередь поиска
   * @param {Number} charId id чара в поиске
   */
  pull(charId) {
    const obj = this.mmQueue.find((el) => el.charId === charId);
    this.mmQueue.splice(this.mmQueue.indexOf(obj), 1);
    // @todo убрать просле дебага
    // eslint-disable-next-line no-console
    console.log('mm pull debug', this.mmQueue);
  }

  /**
   * Добавление обьекта игрока в очередь поиска
   *@param {Object} obj Обьект запроса поиска {charId,psr,startTime}
   */
  push(obj) {
    this.mmQueue.push(obj);
  }

  /**
   * Функция остановки системы подбора игроков
   * admin only
   */
  stop() {
    clearInterval(this.timerId);
  }

  /**
   * Основная функция запуска поиска внутри системы MatchMaking
   */
  start() {
    const _this = this;
    this.timerId = setInterval(() => {
      _this.main();
    }, _this.prefs.checkinterval);
  }

  /**
   * Основная функци работы с очередями
   */
  main() {
    let iter = 0;
    let queue;
    while ((this.mmQueue.length >= 2) && (iter < maxIter)) {
      const mmLength = this.mmQueue.length - 1;
      for (let i = mmLength; i >= 0; i--) {
        // @todo нужно перейти на lodash
        const searcher = this.mmQueue[i];
        if (!searcher) break;
        // пробуем перебрать польз из очереди в одну из уже созданных очередей
        if (this.allQueue.length > 10) {
          // сюда нужна функция чистки allQueue от уже собранных очередей.
          // eslint-disable-next-line no-console
          console.debug('length>10');
          for (const xx in this.allQueue) {
            if (!this.allQueue[xx].open) {
              this.allQueue.splice(xx, 1);
            }
          }
        } else {
          queue = this.allQueue.find((qu) => (qu.policy(searcher) && qu.open));
          if (!queue) {
            queue = new QueueConstructor();
            this.allQueue.push(queue);
          }
          queue.addTo(searcher);
          this.pull(searcher);
        }
      }
      iter += 1;
    }
  }
}

module.exports = MatchMaking;
