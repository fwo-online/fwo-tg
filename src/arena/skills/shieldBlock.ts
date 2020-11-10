import { bold, italic } from '../../utils/formatString';
import type { SuccessArgs } from '../BattleLog';
import { Skill } from '../Constuructors/SkillConstructor';

/**
 * Парирование
 * {me      {((0.3*str) + (0.7*con)) * level}}
 * {enemy   {(0.7*str) + (0.3*con)}}
 * {fall    {2*me - enemy}}
 *
 */
class ShieldBlock extends Skill {
  constructor() {
    super({
      name: 'shieldBlock',
      displayName: 'Блок щитом',
      desc: 'Умение позволяет заблокировать щитом одну физическую атаку (требуется наличие щита)',
      cost: [8, 9, 10, 11, 12, 13],
      proc: 10,
      baseExp: 8,
      costType: 'en',
      orderType: 'self',
      aoeType: 'target',
      chance: [70, 75, 80, 85, 90, 95],
      effect: [1.1, 1.2, 1.3, 1.4, 1.5, 1.6],
      profList: {
        w: 2, l: 6, p: 5, m: 5,
      },
      bonusCost: [10, 20, 30, 40, 60, 80],
    });
  }

  run() {
    const { initiator } = this.params;
    const initiatorSkillLvl = initiator.skills[this.name];
    const effect = this.effect[initiatorSkillLvl - 1] || 1;
    // изменяем
    initiator.flags.isShielded = ((0.3 * initiator.stats.val('str')) + (0.7 * initiator.stats.val('con'))) * effect;
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator)} использовал ${italic(this.displayName)}`;
  }
}

export default new ShieldBlock();
