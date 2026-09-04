import { OrderType } from '@fwo/shared';
import type { ActionType } from '@/arena/Constuructors/types';
import { effectService } from '@/arena/EffectService';
import MiscService from '@/arena/MiscService';
import { floatNumber } from '@/utils/floatNumber';
import { bold, italic } from '@/utils/formatString';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * 🗡️ Точный выпад
 * Выверенный укол в уязвимое место: наносит повышенный урон, а по обезоруженным или оглушенным целям наносит критический урон
 */
class VitalStrike extends Skill {
  actionType: ActionType = 'phys';

  constructor() {
    super({
      name: 'vitalStrike',
      displayName: '🗡️ Точный выпад',
      desc: 'Точный укол в уязвимое место: наносит увеличенный урон (дополнительный урон по обезоруженным и оглушенным целям)',
      cost: [10, 12, 14],
      proc: 10,
      baseExp: 25,
      costType: 'en',
      orderType: OrderType.Enemy,
      aoeType: 'target',
      chance: [75, 85, 95],
      effect: [30, 50, 70],
      profList: { w: 3 },
      bonusCost: [10, 20, 30],
      branch: 'duelist',
    });
  }

  run() {
    const { initiator, target } = this.params;
    const initiatorSkillLvl = initiator.skills[this.name] || 1;
    const bonus = this.effect[initiatorSkillLvl - 1] ?? 30;

    const { min, max } = initiator.stats.val('hit');
    let hit = MiscService.randFloat(min, max) * (1 + bonus / 100);

    const hasControl = target.affects.getEffectsByAction('disarm').length > 0 ||
      target.affects.getEffectsByAction('stun').length > 0;
    if (hasControl) {
      hit = hit * 1.5;
    }

    this.status.effect = floatNumber(hit * initiator.proc);
    effectService.damage(this.context, this);
    this.calculateExp();
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} использовал ${italic(this.displayName)} по ${bold(args.target.nick)} нанеся *${args.effect}* урона`;
  }
}

export const vitalStrike = new VitalStrike();
export default vitalStrike;
