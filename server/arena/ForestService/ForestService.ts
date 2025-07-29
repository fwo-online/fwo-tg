import EventEmitter from 'node:events';
import type { Reward } from '@fwo/shared';
import type { HydratedDocument } from 'mongoose';
import arena from '@/arena';
import { DeerEvent } from '@/arena/ForestService/events/DeerEvent';
import { TreeEvent } from '@/arena/ForestService/events/TreeEvent';
import type { ForestEvent } from '@/arena/ForestService/ForestEvent';
import type GameService from '@/arena/GameService';
import { type Forest, ForestModel } from '@/models/forest';
import { getRandomItemByWeight } from '@/utils/getRandomItemByWeight';

const forestEventsWeights = new Map([
  [DeerEvent, 1],
  [TreeEvent, 1],
]);

const TIMEOUT = 2.5 * 1000; // 2.5s

export class ForestService extends EventEmitter<{
  start: [forest: ForestService];
  'event:start': [event: ForestEvent];
  'event:end': [event: ForestEvent, reward?: Reward];
  'event:fight': [event: ForestEvent, game: GameService];
  'update:time': [timeSpent: number, timeLeft: number];
  end: [];
}> {
  public timeSpent = 0;
  public readonly playerID: string;
  public currentGame?: GameService;
  public checkInterval?: Timer;

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

  get isEventActive(): boolean {
    return this.currentEvent !== undefined;
  }

  get activeEvent(): ForestEvent | null {
    return this.currentEvent || null;
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

  async startEvent(): Promise<void> {
    if (this.isEventActive) {
      return;
    }

    const result = getRandomItemByWeight(
      Array.from(forestEventsWeights.entries()),
      ([_, weight]) => weight,
    );

    if (!result) {
      return;
    }

    const [ForestEvent] = result;

    this.currentEvent = new ForestEvent(this.character);

    this.currentEvent.once('start', (event) => {
      this.emit('event:start', event);
    });

    this.currentEvent.once('end', (event, reward) => {
      this.emit('event:end', event, reward);
      this.currentEvent = undefined;
    });

    this.currentEvent.once('figth', (event, game) => {
      this.emit('event:fight', event, game);
    });

    this.currentEvent.start();
  }

  async acceptEvent(accept: boolean): Promise<void> {
    if (!this.activeEvent) {
      return;
    }

    if (accept) {
      await this.activeEvent.accept();
    } else {
      this.activeEvent.skip();
    }
  }
}
