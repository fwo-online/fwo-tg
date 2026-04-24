import { OrderType } from '@fwo/shared';
import { effectService } from '@/arena/EffectService';
import { DmgMagic } from '../Constuructors/DmgMagicConstructor';
import { isPhysicalDamageResult } from '../Constuructors/utils';

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
      orderType: OrderType.Enemy,
      aoeType: 'target',
      magType: 'bad',
      chance: [95, 95, 95],
      effect: ['1d1', '1d2', '1d1+1'],
      dmgType: 'physical',
      profList: ['p'],
    });
  }

  run(): void {
    const { game } = this.params;
    const results = game.getRoundResults();
    const physicalDamageResults = results.filter(isPhysicalDamageResult);

    if (!physicalDamageResults.length) {
      return;
    }

    const effect = this.effectVal();

    const totalHit = physicalDamageResults.reduce((sum, result) => sum + result.effect, 0);
    this.status.effect = effect + (totalHit / physicalDamageResults.length + 1);

    effectService.damage(this.context, this);
  }
}

export default new PhysicalSadness();
