import EventEmitter from 'node:events';
import type { Reward } from '@fwo/shared';
import type { CharacterService } from '@/arena/CharacterService';
import type GameService from '@/arena/GameService';

export abstract class ForestEvent extends EventEmitter<{
  start: [event: ForestEvent];
  end: [event: ForestEvent, result?: Reward];
  figth: [event: ForestEvent, game: GameService];
}> {
  protected character: CharacterService;
  abstract duration: number;
  protected timer?: Timer;

  constructor(character: CharacterService) {
    super();
    this.character = character;
  }

  start() {
    this.emit('start', this);

    this.timer = setTimeout(() => {
      this.skip();
    }, this.duration);

    return this;
  }

  async accept() {
    const reward = await this.getReward();

    this.emit('end', this, reward);
  }

  skip() {
    clearTimeout(this.timer);
    this.emit('end', this);
  }

  abstract getReward(): MaybePromise<Reward | undefined>;
}
