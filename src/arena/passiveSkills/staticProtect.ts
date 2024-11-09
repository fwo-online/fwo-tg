import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import CastError from '@/arena/errors/CastError';
import MiscService from '@/arena/MiscService';

class StaticProtect extends PassiveSkillConstructor implements Affect {
  constructor() {
    super({
      name: 'staticProtect',
      displayName: 'Статичная защита',
      chance: [0],
      effect: [0],
      bonusCost: [0],
    });
  }

  run() {
    //
  }

  getChance() {
    const { initiator, target } = this.params;
    const attack = initiator.stats.val('phys.attack') * initiator.proc;
    const protect = target.stats.val('static.defence');

    const ratio = attack / protect;

    return Math.round((1 - Math.exp(-2 * ratio)) * 100);
  }

  preAffect: Affect['preAffect'] = (context): undefined => {
    this.applyContext(context);

    const { initiator, target, game } = context.params;
    if (MiscService.rndm('1d100') > this.getChance()) {
      throw new CastError(this.getSuccessResult({ initiator: target, target: initiator, game }));
    }
  };
}

export default new StaticProtect();
