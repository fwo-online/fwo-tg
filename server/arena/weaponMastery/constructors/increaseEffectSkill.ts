import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';

abstract class IncreaseEffectSkill extends PassiveSkillConstructor implements Affect {
  abstract weaponTypes: string[];

  run() {
    this.status.effect *= 1 + (this.getEffect() / 100);
  }

  preAffect: Affect['preAffect'] = (context) => {
    this.reset();
    this.applyContext(context);

    if (!this.isActive()) {
      return;
    }

    if (!this.params.initiator.weapon.isOfType(this.weaponTypes)) {
      return;
    }

    if (!this.checkChance()) {
      return;
    }

    this.run();

    return this.getSuccessResult(this.params);
  };
}

export default IncreaseEffectSkill;
