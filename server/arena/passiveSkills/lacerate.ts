import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import { bleeding } from '@/arena/magics';

class Lacerate extends PassiveSkillConstructor implements Affect {
  weaponTypes = ['cut'];

  constructor() {
    super({
      name: 'lacerate',
      displayName: '🩸Рассечение',
      description: 'Шанс на 🩸Кровотечение при атаке режущим оружием',
      chance: [5, 10, 20],
      effect: [1, 1, 1],
      bonusCost: [],
    });
  }

  run() {
    //
  }

  postAffect: Affect['preAffect'] = (context) => {
    this.applyContext(context);

    const { initiator, target, game } = this.params;
    if (!initiator.weapon.isOfType(this.weaponTypes)) {
      return;
    }

    if (!this.isActive()) {
      return;
    }

    if (!this.checkChance()) {
      return;
    }

    bleeding.applyContext(context);
    bleeding.run();
    bleeding.postRun(initiator, target, game);

    return this.getSuccessResult({ initiator, target, game });
  };
}

export default new Lacerate();
