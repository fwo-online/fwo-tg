import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import CastError from '@/arena/errors/CastError';

class FatesMiss extends PassiveSkillConstructor implements Affect {
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
    //
  }

  isActive(): boolean {
    return true;
  }

  getChance() {
    return this.chance[0];
  }

  preAffect: Affect['preAffect'] = (context): undefined => {
    this.applyContext(context);

    const { initiator, target, game } = context.params;
    if (this.checkChance()) {
      throw new CastError({
        ...this.getSuccessResult({ initiator, target, game }),
        actionType: 'miss',
      });
    }
  };
}

export default new FatesMiss();
