import { bold, italic } from '../../utils/formatString';
import { Skill, SkillNext } from '../Constuructors/SkillConstructor';

/**
 * Берсерк
 */
class Berserk extends Skill {
  constructor() {
    super({
      name: 'berserk',
      displayName: '👹 Берсерк',
      desc: 'Повышает урон, но понижает магзащиту и атаку',
      cost: [8, 9, 10, 11, 12, 13],
      proc: 10,
      baseExp: 8,
      costType: 'en',
      orderType: 'self',
      aoeType: 'target',
      chance: [70, 75, 80, 85, 90, 95],
      effect: [1.1, 1.2, 1.3, 1.4, 1.5, 1.6],
      profList: { w: 4 },
      bonusCost: [10, 20, 30, 40, 60, 80],
    });
  }

  run() {
    const { initiator } = this.params;
    const initiatorMagicLvl = initiator.skills[this.name];
    const effect = this.effect[initiatorMagicLvl - 1] || 1;
    // изменяем
    initiator.stats.mul('hit', effect);
    initiator.stats.mul('patk', (1 / effect));
    initiator.stats.mul('mgp', (1 / effect));

    this.success(this.params);
  }

  customMessage(args: SkillNext) {
    return `${bold(args.initiator)} использовал ${italic(this.displayName)}`;
  }
}

export default new Berserk();
