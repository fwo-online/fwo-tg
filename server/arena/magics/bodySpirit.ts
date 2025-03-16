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
      orderType: 'all',
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

    const effectVal = Math.min(this.effectVal(), maxDamage);
    this.status.effect = effectVal;

    target.stats.down('hp', effectVal);
    initiator.stats.up('mp', effectVal * damageToManaMultiplier);
  }
}

export default new Blessing();
