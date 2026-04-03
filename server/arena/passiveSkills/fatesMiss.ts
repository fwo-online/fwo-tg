import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import CastError from '@/arena/errors/CastError';

class FatesMiss extends PassiveSkillConstructor {
  constructor() {
    super({
      name: 'fatesMiss',
      displayName: 'Промах судьбы',
      description: 'Даже точный удар может отклониться, если того пожелает судьба',
      chance: [5],
      effect: [0],
      bonusCost: [],
    });
  }

  run() {
    const { initiator } = this.params;

    initiator.affects.addPassive({
      action: this.name,
      initiator,
      value: 0,
      onBeforeAction(ctx, action) {
        fatesMiss.onBeforeAction(ctx, action);
      },
    });
  }

  isActive(): boolean {
    return true;
  }

  getChance() {
    return this.chance[0];
  }

  onBeforeAction(ctx: BaseActionContext, action: BaseAction) {
    if (action.actionType !== 'phys') {
      return;
    }

    const { initiator, target, game } = ctx.params;
    this.createContext(initiator, target, game);

    if (this.checkChance()) {
      throw new CastError({
        ...this.getSuccessResult({ initiator, target, game }),
        actionType: 'miss',
      });
    }
  }
}

export const fatesMiss = new FatesMiss();
