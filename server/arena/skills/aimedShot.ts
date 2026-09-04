import { OrderType } from '@fwo/shared';
import type { ActionType } from '@/arena/Constuructors/types';
import { effectService } from '@/arena/EffectService';
import CastError from '@/arena/errors/CastError';
import MiscService from '@/arena/MiscService';
import { floatNumber } from '@/utils/floatNumber';
import { bold, italic } from '@/utils/formatString';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * 🎯 Прицельный выстрел
 * Выверенный выстрел из лука с повышенной точностью и уроном
 */
class AimedShot extends Skill {
  actionType: ActionType = 'phys';
  weaponTypes = ['range'];

  constructor() {
    super({
      name: 'aimedShot',
      displayName: '🎯 Прицельный выстрел',
      desc: 'Выверенный выстрел из лука: наносит увеличенный критический урон одиночной цели',
      cost: [10, 12, 14],
      proc: 10,
      baseExp: 25,
      costType: 'en',
      orderType: OrderType.Enemy,
      aoeType: 'target',
      chance: [85, 90, 95],
      effect: [50, 75, 100],
      profList: { l: 2 },
      bonusCost: [10, 20, 30],
      branch: 'marksman',
    });
  }

  run() {
    const { initiator } = this.params;
    if (!initiator.weapon.isOfType(this.weaponTypes)) {
      throw new CastError('NO_WEAPON');
    }

    const initiatorSkillLvl = initiator.skills[this.name] || 1;
    const bonus = this.effect[initiatorSkillLvl - 1] ?? 50;

    const { min, max } = initiator.stats.val('hit');
    const hit = MiscService.randFloat(min, max) * (1 + bonus / 100);

    this.status.effect = floatNumber(hit * initiator.proc);
    effectService.damage(this.context, this);
    this.calculateExp();
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} использовал ${italic(this.displayName)} по ${bold(args.target.nick)} нанеся *${args.effect}* урона`;
  }
}

export const aimedShot = new AimedShot();
export default aimedShot;
