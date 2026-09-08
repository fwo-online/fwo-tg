import { OrderType } from '@fwo/shared';
import { floatNumber } from '@/utils/floatNumber';
import { bold, brackets, italic } from '@/utils/formatString';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * 🏃 Подножка
 * Ловкий приём: сбивает противника с ног, снижая его защиту (wpr) и атаку (wat) в текущем раунде
 */
class Step extends Skill {
  constructor() {
    super({
      name: 'step',
      displayName: '🏃 Подножка',
      desc: 'Ловкий приём: сбивает цель с ног, снижая её защиту и атаку в текущем раунде',
      cost: [8, 9, 10, 11, 12, 13],
      proc: 10,
      baseExp: 20,
      costType: 'en',
      orderType: OrderType.Enemy,
      aoeType: 'target',
      chance: [70, 75, 80, 85, 90, 95],
      effect: [0.6, 0.55, 0.5, 0.45, 0.4, 0.35],
      profList: { l: 3 },
      bonusCost: [10, 20, 30, 40, 60, 80],
      branch: 'scout',
      branches: ['scout'],
    });
  }

  run() {
    const { initiator, target } = this.params;
    const initiatorSkillLvl = initiator.skills[this.name] || 1;
    const level = this.effect[initiatorSkillLvl - 1] ?? 0.6;

    target.stats.mul('phys.defence', level);
    target.stats.mul('phys.attack', floatNumber(level + 0.2));

    this.status.effect = level;
    this.calculateExp();
  }

  customMessage(args: SuccessArgs) {
    const defRed = Math.round((1 - args.effect) * 100);
    const atkRed = Math.round((1 - (args.effect + 0.2)) * 100);
    return `${bold(args.initiator.nick)} сделал ${italic(this.displayName)} противнику ${bold(args.target.nick)} ${brackets(`🛡️-${defRed}% защиты, ⚔️-${atkRed}% атаки`)}`;
  }
}

export const step = new Step();
export default step;
