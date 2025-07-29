import type { Reward } from '@fwo/shared';
import { ForestEvent } from '@/arena/ForestService/ForestEvent';
import MiscService from '@/arena/MiscService';

export class CampEvent extends ForestEvent {
  duration = 30 * 1000;

  getReward(): MaybePromise<Reward> {
    return {
      exp: MiscService.randInt(50, 100),
      components: {
        fabric: MiscService.randInt(2, 5),
      },
    };
  }
}
