import { ForestEventType } from '@fwo/shared';
import { ForestEvent } from '@/arena/ForestService/ForestEvent';
import MiscService from '@/arena/MiscService';

type TreeEventActions = 'inspect' | 'collect' | 'leave';

export class TreeEvent extends ForestEvent<TreeEventActions> {
  override type = ForestEventType.Tree;
  override duration = 30 * 1000;

  override getActions() {
    return ['inspect', 'collect', 'leave'] satisfies TreeEventActions[];
  }

  private handleInspect() {
    if (MiscService.chance(50)) {
      /** @todo начать бой с пауком */
      return;
    }

    this.next({
      gold: MiscService.randInt(10, 25),
      components: {
        leather: MiscService.randInt(0, 2),
      },
    });
  }

  private handleCollect() {
    this.next({
      components: {
        wood: MiscService.randInt(1, 3),
      },
    });
  }

  performAction(action: TreeEventActions) {
    switch (action) {
      case 'inspect':
        return this.handleInspect();
      case 'collect':
        return this.handleCollect();
      case 'leave':
        return this.next();
    }
  }
}
