import { isString } from 'es-toolkit';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { ActionType, BreaksMessage, SuccessArgs } from '@/arena/Constuructors/types';

abstract class CounterEvasionSkill extends PassiveSkillConstructor {
  abstract weaponTypes: string[];
  abstract affectedActionTypes: ActionType[];

  run() {
    const { initiator } = this.params;
    initiator.affects.addPassive({
      action: this.name,
      initiator: this.params.initiator,
      value: 0,
      onCastFail: (ctx, action, reason) => {
        return this.onCastFail(ctx, action, reason);
      },
    });
  }

  checkAffectCanBeHandled(affect: SuccessArgs | SuccessArgs[] | BreaksMessage) {
    if (isString(affect) || Array.isArray(affect)) {
      return false;
    }

    return this.affectedActionTypes.includes(affect.actionType);
  }

  onCastFail(
    ctx: BaseActionContext,
    _action: BaseAction,
    reason: SuccessArgs | SuccessArgs[] | BreaksMessage,
  ) {
    this.reset();

    const { initiator, target, game } = ctx.params;
    this.createContext(initiator, target, game);
    if (!this.isActive(ctx.params)) {
      return;
    }

    if (!this.checkAffectCanBeHandled(reason)) {
      return;
    }

    if (!initiator.weapon.isOfType(this.weaponTypes)) {
      return;
    }

    if (!this.checkChance(ctx.params)) {
      return;
    }

    if (!this.getEffect(ctx.params)) {
      return;
    }

    const result = this.getSuccessResult(this.context.params);
    ctx.status.affects.push(result);
    return result;
  }
}

export default CounterEvasionSkill;
