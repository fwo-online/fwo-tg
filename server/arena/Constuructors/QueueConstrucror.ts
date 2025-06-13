import arena from '@/arena';
import config from '@/arena/config';
import { createLadderGame, createTower } from '@/helpers/gameHelper';
import type { GameType } from '@fwo/shared';

export type QueueItem = {
  id: string;
  startTime: number;
  queue: GameType;
};

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

  override async start(): Promise<void> {
    await createTower(this.items.splice(0, config.maxPlayersLimit).map(({ id }) => id));
    await super.start();
  }
}
