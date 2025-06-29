import type { GameType } from '@fwo/shared';
import arena from '@/arena';
import config from '@/arena/config';
import ValidationError from '@/arena/errors/ValidationError';
import { createLadderGame } from '@/helpers/gameHelper';
import { createTower } from '@/helpers/towerHelper';

export type QueueItem = {
  id: string;
  startTime: number;
  queue: GameType;
};

export interface Queue {
  validate?(item: QueueItem): void;
}

export abstract class Queue {
  open = true;
  items: QueueItem[] = [];

  push(item: QueueItem): void {
    this.items.push(item);
  }

  abstract checkStatus(): boolean;

  async start(): Promise<void> {
    this.open = false;
  }
}

export class LadderQueue extends Queue {
  checkStatus(): boolean {
    if (this.items.length < config.minPlayersLimit) {
      return false;
    }

    const playersByClan = this.items.reduce<Record<string, number>>((acc, { id }) => {
      const clan = arena.characters[id].clan;
      if (clan) {
        acc[clan.name] ??= 0;
        acc[clan.name]++;
      }
      return acc;
    }, {});
    return Object.values(playersByClan).every((count) => count <= this.items.length / 2);
  }

  override async start(): Promise<void> {
    await createLadderGame(this.items.splice(0, config.maxPlayersLimit).map(({ id }) => id));
    await super.start();
  }
}

export class TowerQueue extends Queue {
  checkStatus(): boolean {
    return this.items.length >= config.minPlayersLimit;
  }

  validate(item: QueueItem) {
    const character = arena.characters[item.id];

    if (!character.towerAvailable) {
      throw new ValidationError('Сегодня врата башни закрыты для тебя');
    }
  }

  override async start(): Promise<void> {
    await createTower(this.items.splice(0, config.maxPlayersLimit).map(({ id }) => id));
    await super.start();
  }
}
