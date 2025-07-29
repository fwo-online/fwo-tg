import EventEmitter from 'node:events';
import type { Reward } from '@fwo/shared';
import { mapValues, mergeWith } from 'es-toolkit';
import { add } from 'es-toolkit/compat';
import type { HydratedDocument } from 'mongoose';
import arena from '@/arena';
import { getRandomEvent } from '@/arena/ForestService/events';
import type { ForestEvent } from '@/arena/ForestService/ForestEvent';
import type GameService from '@/arena/GameService';
import { type Forest, ForestModel } from '@/models/forest';

const TIMEOUT = 2.5 * 1000; // 2.5s

export class ForestService extends EventEmitter<{
  start: [forest: ForestService];
  'event:start': [event: ForestEvent];
  'event:end': [event: ForestEvent, reward?: Reward];
  'event:fight': [event: ForestEvent, game: GameService];
  'update:time': [timeSpent: number, timeLeft: number];
  end: [];
}> {
  timeSpent = 0;
  readonly playerID: string;
  currentGame?: GameService;
  checkInterval?: Timer;
  rewards: Required<Omit<Reward, 'item'>> = {
    exp: 0,
    gold: 0,
    components: {},
  };

  private forest!: HydratedDocument<Forest>;
  private currentEvent?: ForestEvent;

  private constructor(playerID: string) {
    super();
    this.playerID = playerID;
  }

  static emitter = new EventEmitter<{ start: [ForestService] }>();

  get id(): string {
    return this.forest.id;
  }

  get character() {
    return arena.characters[this.playerID];
  }

  private async start(): Promise<void> {
    this.forest = await ForestModel.create({ player: this.playerID });
    arena.forests[this.id] = this;

    console.debug('Forest debug:: create forest', this.id);

    this.character.forestID = this.id;
    ForestService.emitter.emit('start', this);
    this.emit('start', this);
  }

  static async createForest(playerID: string): Promise<ForestService> {
    const forest = new ForestService(playerID);
    await forest.start();
    return forest;
  }

  initHandlers(): void {
    this.checkInterval = setInterval(async () => {
      this.timeSpent += TIMEOUT;
      console.debug('Forest debug:: tick:', this.timeSpent);
    }, TIMEOUT);
  }

  endForest(lose = false) {
    clearInterval(this.checkInterval);

    if (lose) {
      this.rewards.components = mapValues(this.rewards.components, (value = 0) =>
        Math.round(value * 0.5),
      );
      this.rewards.gold = Math.round(this.rewards.gold * 0.5);
    }
  }

  private addRewards(reward: Reward) {
    this.rewards.exp += reward.exp ?? 0;
    this.rewards.gold += reward.gold ?? 0;
    mergeWith(this.rewards.components, reward.components ?? {}, add);
  }

  async saveRevards() {
    this.character.resources.addResources({
      components: this.rewards.components,
      gold: this.rewards.gold,
      exp: this.rewards.exp,
    });
  }

  async startEvent(): Promise<void> {
    if (this.currentEvent) {
      return;
    }

    this.currentEvent = getRandomEvent(this.character);

    if (!this.currentEvent) {
      console.error('forest service::: no event created');
      return;
    }

    this.currentEvent.once('start', (event) => {
      this.emit('event:start', event);
    });

    this.currentEvent.once('end', (event, reward) => {
      if (reward) {
        this.addRewards(reward);
      }
      this.emit('event:end', event, reward);
      this.currentEvent = undefined;
    });

    this.currentEvent.start();
  }

  async performAction(action: string): Promise<void> {
    if (!this.currentEvent) {
      return;
    }

    await this.currentEvent.performAction(action);
  }
}
