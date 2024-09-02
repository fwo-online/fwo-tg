import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { ActionType, SuccessArgs } from '@/arena/Constuructors/types';
import { normalizeToArray } from '@/utils/array';

abstract class CounterEvasionSkill extends PassiveSkillConstructor implements Affect {
  abstract weaponTypes: string[];
  abstract affectedActionType: ActionType;

  run() {
    //
  }

  checkAffectCanBeHandled(affect: SuccessArgs | SuccessArgs[]) {
    const [normalizedAffect] = normalizeToArray(affect);
    return normalizedAffect.actionType === this.affectedActionType;
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
