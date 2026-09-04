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
 * 🎯 Бронебойный выстрел
 * Выстрел тяжёлой стрелой, игнорирующей часть физической защиты цели
 */
class PiercingShot extends Skill {
  actionType: ActionType = 'phys';
  weaponTypes = ['range'];

  constructor() {
    super({
      name: 'piercingShot',
      displayName: '🎯 Бронебойный выстрел',
      desc: 'Выстрел бронебойной стрелой, игнорирующей большую часть защиты цели',
      cost: [12, 14, 16],
      proc: 10,
      baseExp: 25,
      costType: 'en',
      orderType: OrderType.Enemy,
      aoeType: 'target',
      chance: [75, 85, 95],
      effect: [40, 60, 80],
      profList: { l: 3 },
      bonusCost: [10, 20, 30],
      branch: 'marksman',
    });
  }

  run() {
    const { initiator, target } = this.params;
    if (!initiator.weapon.isOfType(this.weaponTypes)) {
      throw new CastError('NO_WEAPON');
    }

    const initiatorSkillLvl = initiator.skills[this.name] || 1;
    const ignorePercent = this.effect[initiatorSkillLvl - 1] ?? 50;

    const { min, max } = initiator.stats.val('hit');
    const hit = MiscService.randFloat(min, max);
    this.status.effect = floatNumber(hit * initiator.proc);

    const targetDef = target.stats.val('phys.defence');
    const defReduction = targetDef * (ignorePercent / 100);

    target.stats.down('phys.defence', defReduction);
    try {
      effectService.damage(this.context, this);
    } finally {
      target.stats.up('phys.defence', defReduction);
    }

    this.calculateExp();
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} использовал ${italic(this.displayName)} по ${bold(args.target.nick)} нанеся *${args.effect}* урона`;
  }
}

export const piercingShot = new PiercingShot();
export default piercingShot;
