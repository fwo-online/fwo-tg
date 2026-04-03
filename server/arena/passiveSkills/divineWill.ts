import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { Magic } from '@/arena/Constuructors/MagicConstructor';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { BreaksMessage, SuccessArgs } from '@/arena/Constuructors/types';
import CastError from '@/arena/errors/CastError';

const affectName = 'CHANCE_FAIL';

class DivineWill extends PassiveSkillConstructor {
  constructor() {
    super({
      name: 'divineWill',
      displayName: 'Воля богов',
      description: 'Боги вмешиваются в исход заклинания, превращая провал в успех — или наоборот',
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
        divineWill.onBeforeAction(ctx, action);
      },
      onCastFail(ctx, action, reason) {
        return divineWill.onCastFail(ctx, action, reason);
      },
    });
  }

  isActive(): boolean {
    return true;
  }

  getChance() {
    return this.chance[0];
  }

  onCastFail(
    ctx: BaseActionContext,
    action: BaseAction,
    reason: SuccessArgs | SuccessArgs[] | BreaksMessage,
  ): SuccessArgs | SuccessArgs[] | undefined {
    if (!(action instanceof Magic)) {
      return;
    }

    if (reason !== affectName) {
      return;
    }

    const { initiator, target, game } = ctx.params;
    this.createContext(initiator, target, game);

    if (this.checkChance()) {
      const result = this.getSuccessResult(this.context.params);
      ctx.status.affects.push(result);
      return result;
    }
  }

  onBeforeAction(ctx: BaseActionContext, action: BaseAction) {
    if (!(action instanceof Magic)) {
      return;
    }

    const { initiator, target, game } = ctx.params;
    this.createContext(initiator, target, game);

    if (this.checkChance()) {
      throw new CastError(this.getSuccessResult({ initiator, target, game }));
    }
  }
}

export const divineWill = new DivineWill();
