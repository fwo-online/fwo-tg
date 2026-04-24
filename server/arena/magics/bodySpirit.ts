import { OrderType } from '@fwo/shared';
import { effectService } from '@/arena/EffectService';
import { DmgMagic } from '../Constuructors/DmgMagicConstructor';

const damageToManaMultiplier = 0.5;
const minimumTargetHeath = 0.5;

class Blessing extends DmgMagic {
  constructor() {
    super({
      name: 'bodySpirit',
      displayName: 'Дух тела',
      desc: 'Забирает жизнь цели, и превращает в ману кастующего',
      cost: 22,
      baseExp: 8,
      costType: 'mp',
      lvl: 4,
      orderType: OrderType.All,
      aoeType: 'target',
      magType: 'bad',
      dmgType: 'physical',
      chance: [92, 94, 95],
      effect: ['1d4', '1d5+2', '1d6+3'],
      profList: ['p'],
    });
  }

  run() {
    const { initiator, target } = this.params;

    const targetHp = target.stats.val('hp');
    const maxDamage = Math.max(targetHp - minimumTargetHeath, 0);

    this.status.effect = Math.min(this.effectVal(), maxDamage);
    const value = effectService.damage(this.context, this);

    initiator.stats.up('mp', value * damageToManaMultiplier);
  }
}

export default new Blessing();
