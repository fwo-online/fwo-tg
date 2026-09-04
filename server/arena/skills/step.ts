import { OrderType } from '@fwo/shared';
import type { ActionType } from '@/arena/Constuructors/types';
import { effectService } from '@/arena/EffectService';
import MiscService from '@/arena/MiscService';
import { floatNumber } from '@/utils/floatNumber';
import { bold, brackets, italic } from '@/utils/formatString';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * 🏃 Подножка
 * Ловкий приём: сбивает цель с ног, нанося урон и снижая её атаку на 1 раунд
 */
class Step extends Skill {
  actionType: ActionType = 'phys';

  constructor() {
    super({
      name: 'step',
      displayName: '🏃 Подножка',
      desc: 'Ловкий приём: сбивает противника с ног, нанося урон и снижая его атаку на 1 раунд',
      cost: [8, 10, 12],
      proc: 10,
      baseExp: 20,
      costType: 'en',
      orderType: OrderType.Enemy,
      aoeType: 'target',
      chance: [75, 85, 95],
      effect: [20, 30, 40], // процент снижения атаки цели
      profList: { l: 3 },
      bonusCost: [10, 20, 30],
      branch: 'scout',
    });
  }

  run() {
    const { initiator, target } = this.params;
    const initiatorSkillLvl = initiator.skills[this.name] || 1;
    const slowPercent = this.effect[initiatorSkillLvl - 1] ?? 25;

    const { min, max } = initiator.stats.val('hit');
    const hit = MiscService.randFloat(min, max) * 0.5;
    this.status.effect = floatNumber(hit * initiator.proc);

    target.affects.addLongEffect({
      action: this.name,
      duration: 1,
      proc: initiator.proc,
      initiator,
      value: slowPercent,
      onBeforeDamageDeal(dealCtx, action, affect) {
        if (action.actionType === 'phys') {
          const red = affect.value ?? 25;
          dealCtx.status.effect = Math.round(dealCtx.status.effect * (1 - red / 100));
        }
      },
    });

    effectService.damage(this.context, this);
    this.calculateExp();
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} сделал ${italic(this.displayName)} противнику ${bold(args.target.nick)} ${brackets(`🏃-${args.effect}% атаки`)}`;
  }
}

export const step = new Step();
export default step;
