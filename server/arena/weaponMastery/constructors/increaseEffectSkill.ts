import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';

abstract class IncreaseEffectSkill extends PassiveSkillConstructor {
  abstract weaponTypes: string[];

  run() {
    this.params.initiator.affects.addPassive({
      action: this.name,
      initiator: this.params.initiator,
      value: 0,
      onBeforeDamageDeal: (ctx, action) => {
        this.onBeforeDamageDeal(ctx, action);
      },
    });
  }

  onBeforeDamageDeal(ctx: BaseActionContext, action: BaseAction) {
    if (action.actionType !== 'phys') {
      return;
    }

    const { initiator, target, game } = ctx.params;
    this.createContext(initiator, target, game);
    if (!this.isActive(ctx.initiator)) {
      return;
    }

    if (!initiator.weapon.isOfType(this.weaponTypes)) {
      return;
    }

    if (!this.checkChance(ctx)) {
      return;
    }

    ctx.status.effect *= 1 + this.getEffect(ctx) / 100;

    ctx.addAffect(this, this.context);
  }
}

export default IncreaseEffectSkill;
