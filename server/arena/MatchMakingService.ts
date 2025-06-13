import { EventEmitter } from 'node:events';
import config from './config';
import {
  LadderQueue,
  type QueueItem,
  TowerQueue,
  type Queue,
} from './Constuructors/QueueConstrucror';
import type { GameType } from '@fwo/shared';
import { mapValues } from 'es-toolkit';

/**
 * MatchMaking system
 * @module Service/MatchMaking
 * @description Класс объекта MM, для сбора игр
 * */

/**
 * Общий класс объекта MatchMaking
 */
class MatchMaking extends EventEmitter<{
  list: [players: Record<GameType, QueueItem[]>];
  push: [player: QueueItem];
  pull: [player: QueueItem];
}> {
  allQueue: Record<GameType, Queue> = {
    tower: new TowerQueue(),
    ladder: new LadderQueue(),
  };
  timers: Partial<Record<GameType, NodeJS.Timer>> = {};
  playerAttempts: Record<string, number[]> = {};

  /**
   * Удаление объекта игрока в очередь поиска
   * @param id id чара в поиске
   */
  pull(id: string) {
    Object.entries(this.allQueue).forEach(([type, queue]) => {
      const index = queue.items.findIndex((item) => id === item.id);
      if (index !== -1) {
        const [item] = queue.items.splice(index, 1);
        this.emit('pull', item);
        this.list();
        this.main(type as GameType);
      }
    });
    console.debug('MM pull debug', id);
  }

  /**
   * Добавление объекта игрока в очередь поиска
   * @param obj Объект запроса поиска {charId,psr,startTime}
   */
  push(item: QueueItem) {
    const queue = this.allQueue[item.queue];

    if (queue.items.some(({ id }) => id === item.id)) {
      return;
    }

    this.validate(item);

    queue.push(item);
    this.emit('push', item);
    this.list();
    this.main(item.queue);
  }

  validate(item: QueueItem) {
    const now = Date.now();

    this.playerAttempts[item.id] = (this.playerAttempts[item.id] || []).filter(
      (timestamp) => now - timestamp < 5 * 60 * 1000,
    );

    if (this.playerAttempts[item.id].length >= 5) {
      throw new Error('Слишком много попыток, попобуй позднее');
    }

    this.playerAttempts[item.id].push(now);
  }

  list() {
    this.emit(
      'list',
      mapValues(this.allQueue, (queue) => queue.items),
    );
  }

  /**
   * Функция остановки системы подбора игроков
   */
  stop(type: GameType) {
    if (this.timers[type]) {
      clearInterval(this.timers[type]);
    }
  }

  /**
   * Добавляем игроков в комнату
   */
  async start(type: GameType) {
    const queue = this.allQueue[type];
    if (queue.checkStatus()) {
      await queue.start();
      this.list();
    }
  }

  /**
   * Запускаем очистку и создаём новую очередь
   */
  reset(type: GameType) {
    const queue = this.allQueue[type];
    queue.open = true;
    this.main(type);
  }

  /**
   * Основная функции работы с очередями
   */
  main(type: GameType) {
    this.stop(type);
    const queue = this.allQueue[type];
    if (queue.open && queue.checkStatus()) {
      this.timers[type] = setTimeout(() => {
        this.start(type);
      }, config.startGameTimeout);
    }
  }
}

const matchMaking = new MatchMaking();
export default matchMaking;
