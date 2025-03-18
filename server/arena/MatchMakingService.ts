import { EventEmitter } from 'node:events';
import _ from 'lodash';
import config from './config';
import QueueConstructor from './Constuructors/QueueConstrucror';
import arena from './index';
import type GameService from './GameService';

/**
 * MatchMaking system
 * @module Service/MatchMaking
 * @description Класс объекта MM, для сбора игр
 * */

export type MatchMakingItem = {
  id: string;
  psr: number;
  startTime: number;
};
/**
 * Общий класс объекта MatchMaking
 */
class MatchMaking extends EventEmitter<{
  start: [game: GameService];
  list: [players: MatchMakingItem[]];
  push: [player: MatchMakingItem];
  pull: [player: MatchMakingItem];
}> {
  allQueue: QueueConstructor[] = [];
  mmQueue: MatchMakingItem[] = [];
  timerId?: NodeJS.Timer;
  playerAttempts: Record<string, number[]> = {};

  checkStatus() {
    const [withClans] = _.partition(this.mmQueue, (mmObj) => arena.characters[mmObj.id].clan);
    const clans = _.groupBy(withClans, (mmObj) => arena.characters[mmObj.id].clan?.id);
    const isEveryEnemy = Object.values(clans).every((c) => c.length <= this.mmQueue.length / 2);
    return this.mmQueue.length >= config.minPlayersLimit && isEveryEnemy;
  }

  /**
   * Удаление объекта игрока в очередь поиска
   * @param id id чара в поиске
   */
  pull(id: string) {
    const obj = this.mmQueue.find((el) => el.id === id);
    if (obj) {
      this.mmQueue.splice(this.mmQueue.indexOf(obj), 1);
      this.main();
      this.emit('pull', obj);
      this.emit('list', this.mmQueue);
    }
    // @todo убрать после дебага
    console.log('MM pull debug', this.mmQueue);
  }

  /**
   * Добавление объекта игрока в очередь поиска
   * @param obj Объект запроса поиска {charId,psr,startTime}
   */
  push(obj: MatchMakingItem) {
    if (this.mmQueue.some((el) => el.id === obj.id)) {
      return;
    }

    const now = Date.now();

    this.playerAttempts[obj.id] = (this.playerAttempts[obj.id] || []).filter(
      (timestamp) => now - timestamp < 5 * 60 * 1000,
    );

    if (this.playerAttempts[obj.id].length >= 5) {
      throw new Error('Слишком много попыток, попобуй позднее');
    }

    this.playerAttempts[obj.id].push(now);

    if (this.mmQueue.some((el) => el.id === obj.id)) {
      return;
    }

    this.mmQueue.push(obj);
    this.emit('push', obj);
    this.emit('list', this.mmQueue);
    this.main();
  }

  /**
   * Функция остановки системы подбора игроков
   * admin only
   */
  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
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
        queue.goStartGame().then((game) => {
          if (game) {
            this.emit('start', game);
          }
        });
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
   * Основная функции работы с очередями
   */
  main() {
    this.stop();
    if (this.checkStatus()) {
      this.timerId = setTimeout(() => {
        this.start();
      }, config.startGameTimeout);
    }
  }
}

const matchMaking = new MatchMaking();
export default matchMaking;
