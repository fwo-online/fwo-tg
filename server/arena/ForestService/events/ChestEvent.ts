import type { Reward } from '@fwo/shared';
import { ForestEvent } from '@/arena/ForestService/ForestEvent';
import MiscService from '@/arena/MiscService';

export class ChestEvent extends ForestEvent {
  duration = 30 * 1000;

  getReward(): MaybePromise<Reward> {
    return {
      exp: MiscService.randInt(50, 100),
      components: {
        iron: MiscService.randInt(1, 2),
      },
    };
  }
}
