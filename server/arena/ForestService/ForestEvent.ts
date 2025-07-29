import EventEmitter from 'node:events';
import type { ForestEventType, Reward } from '@fwo/shared';
import type { CharacterService } from '@/arena/CharacterService';
import type GameService from '@/arena/GameService';

export abstract class ForestEvent<Action extends string = string> extends EventEmitter<{
  start: [event: ForestEvent, actions: Action[]];
  end: [event: ForestEvent, result?: Reward];
  figth: [event: ForestEvent, game: GameService];
}> {
  abstract type: ForestEventType;
  abstract duration: number;
  protected character: CharacterService;
  protected timer?: Timer;

  constructor(character: CharacterService) {
    super();
    this.character = character;
  }

  abstract getActions(): Action[];
  abstract performAction(action: Action): MaybePromise<void>;

  start() {
    this.emit('start', this, this.getActions());

    this.timer = setTimeout(() => {
      this.next();
    }, this.duration);

    return this;
  }

  next(reward?: Reward) {
    clearTimeout(this.timer);
    this.emit('end', this, reward);
  }
}
