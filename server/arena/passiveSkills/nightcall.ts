import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import CastError from '@/arena/errors/CastError';

class NightCall extends PassiveSkillConstructor implements Affect {
  weaponTypes = ['cut'];

  constructor() {
    super({
      name: 'nightcall',
      displayName: '🌕Зов ночи',
      description: 'Даёт имунитет к усыплению',
      chance: [100],
      effect: [],
      bonusCost: [],
    });
  }

  run() {
    //
  }

  preAffect: Affect['preAffect'] = (context) => {
    this.applyContext(context);

    if (!this.isActive()) {
      return undefined;
    }

    const { initiator, target, game } = context.params;

    throw new CastError({
      ...this.getSuccessResult({ initiator, target, game }),
      actionType: 'passive',
    });
  };
}

export default new NightCall();
