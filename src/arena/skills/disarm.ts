import { bold, italic } from '../../utils/formatString';
import { PreAffect } from '../Constuructors/PreAffect';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * Обезаруживание
 */
class Disarm extends Skill implements PreAffect {
  constructor() {
    super({
      name: 'disarm',
      displayName: '🥊 Обезаруживание',
      desc: 'Обезаруживает противника, не давая ему совершить атаку оружием',
      cost: [12, 13, 14, 15, 16, 17],
      proc: 10,
      baseExp: 20,
      costType: 'en',
      orderType: 'enemy',
      aoeType: 'target',
      chance: [70, 75, 80, 85, 90, 95],
      effect: [1.1, 1.2, 1.3, 1.4, 1.5, 1.6],
      profList: { w: 3, l: 5 },
      bonusCost: [10, 20, 30, 40, 60, 80],
    });
  }

  run() {
    const { initiator, target } = this.params;
    const initiatorMagicLvl = initiator.skills[this.name];
    const effect = this.effect[initiatorMagicLvl - 1] || 1;
    // изменяем
    const iDex = initiator.stats.val('dex') * effect;
    const tDex = target.stats.val('dex');
    if (iDex >= tDex) {
      target.flags.isDisarmed = true;

      this.success(this.params);
    } else {
      this.fail('SKILL_FAIL', this.params);
    }
  }

  check({ initiator, target, game } = this.params) {
    if (initiator.flags.isDisarmed) {
      return this.getFailResult('DISARM', { initiator, target, game });
    }
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator)} использовал ${italic(this.displayName)} `;
  }
}

export default new Disarm();
