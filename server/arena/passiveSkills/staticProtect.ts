import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import CastError from '@/arena/errors/CastError';

class StaticProtect extends PassiveSkillConstructor implements Affect {
  constructor() {
    super({
      name: 'staticProtect',
      displayName: 'Статичная защита',
      description: 'Пассивный шанс заблокировать атаку',
      chance: [0],
      effect: [0],
      bonusCost: [],
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

    if (!this.isActive()) {
      return;
    }

    const { initiator, target, game } = context.params;
    if (!this.checkChance()) {
      throw new CastError(this.getSuccessResult({ initiator: target, target: initiator, game }));
    }
  };
}

export default new StaticProtect();
