import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { ActionType, BreaksMessage, SuccessArgs } from '@/arena/Constuructors/types';
import { isString } from 'es-toolkit';

abstract class CounterEvasionSkill extends PassiveSkillConstructor implements Affect {
  abstract weaponTypes: string[];
  abstract affectedActionTypes: ActionType[];

  run() {
    //
  }

  checkAffectCanBeHandled(affect: SuccessArgs | BreaksMessage) {
    if (isString(affect)) {
      return false;
    }

    return this.affectedActionTypes.includes(affect.actionType);
  }

  affectHandler: Affect['affectHandler'] = (context, affect) => {
    this.reset();
    this.applyContext(context);

    if (!this.isActive()) {
      return;
    }

    if (!this.checkAffectCanBeHandled(affect)) {
      return;
    }

    if (!this.params.initiator.weapon.isOfType(this.weaponTypes)) {
      return;
    }

    if (!this.checkChance()) {
      return;
    }

    if (!this.getEffect()) {
      return;
    }

    return this.getSuccessResult(this.context.params);
  };
}

export default CounterEvasionSkill;
