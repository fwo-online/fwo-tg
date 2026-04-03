import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';

abstract class IncreaseEffectSkill extends PassiveSkillConstructor {
  abstract weaponTypes: string[];

  run() {
    this.params.initiator.affects.addPassive({
      action: this.name,
      initiator: this.params.initiator,
      value: 0,
      onBeforeAction: (ctx, action) => {
        this.onBeforeAction(ctx, action);
      },
    });
  }

  onBeforeAction(ctx: BaseActionContext, action: BaseAction) {
    if (action.actionType !== 'phys') {
      return;
    }

    const { initiator, target, game } = ctx.params;
    this.createContext(initiator, target, game);
    if (!this.isActive(ctx.params)) {
      return;
    }

    if (!initiator.weapon.isOfType(this.weaponTypes)) {
      return;
    }

    if (!this.checkChance(ctx.params)) {
      return;
    }

    ctx.status.effect *= 1 + this.getEffect(ctx.params) / 100;
    ctx.status.affects.push(this.getSuccessResult(this.params));
  }
}

export default IncreaseEffectSkill;
