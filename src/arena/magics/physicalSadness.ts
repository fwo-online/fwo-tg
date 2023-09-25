import { DmgMagic } from '../Constuructors/DmgMagicConstructor';
import type { PhysNext } from '../Constuructors/types';
import { isSuccessDamageResult } from '../Constuructors/utils';

const isPhysicalDamage = (result): result is PhysNext => {
  if (isSuccessDamageResult(result)) {
    return result.actionType === 'phys';
  }

  return false;
};

class PhysicalSadness extends DmgMagic {
  constructor() {
    super({
      name: 'physicalSadness',
      displayName: 'Вселенская скорбь',
      desc: 'Заставляет цель ощущать всю боль физически раненых этого раунда.',
      cost: 20,
      baseExp: 8,
      costType: 'mp',
      lvl: 4,
      orderType: 'enemy',
      aoeType: 'target',
      magType: 'bad',
      chance: [95, 95, 95],
      effect: ['1d1', '1d2', '1d1+1'],
      dmgType: 'physical',
      profList: ['p'],
    });
  }

  run(): void {
    const { target, game } = this.params;
    const results = game.getRoundResults();
    const physicalDamageResults = results.filter(isPhysicalDamage);

    if (!physicalDamageResults.length) {
      return;
    }

    const effect = this.effectVal();

    const totalHit = physicalDamageResults.reduce((sum, result) => sum + result.dmg, 0);
    const hit = effect + (totalHit / physicalDamageResults.length + 1);

    this.status.hit = hit;

    target.stats.down('hp', hit);
  }
}

export default new PhysicalSadness();
