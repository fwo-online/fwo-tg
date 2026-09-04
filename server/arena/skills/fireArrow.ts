import { OrderType } from '@fwo/shared';
import type { ActionType } from '@/arena/Constuructors/types';
import { burning } from '@/arena/effects';
import { effectService } from '@/arena/EffectService';
import CastError from '@/arena/errors/CastError';
import MiscService from '@/arena/MiscService';
import { floatNumber } from '@/utils/floatNumber';
import { bold, italic } from '@/utils/formatString';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * 🏹🔥 Зажигательная стрела
 * Выстрел стрелой с алхимической смесью: наносит урон и поджигает цель
 */
class FireArrow extends Skill {
  actionType: ActionType = 'phys';
  weaponTypes = ['range'];

  constructor() {
    super({
      name: 'fireArrow',
      displayName: '🏹 Зажигательная стрела',
      desc: 'Выстрел стрелой с алхимическим огнём: наносит физический урон и поджигает цель на 2 раунда',
      cost: [12, 14, 16],
      proc: 10,
      baseExp: 25,
      costType: 'en',
      orderType: OrderType.Enemy,
      aoeType: 'target',
      chance: [80, 85, 90],
      effect: [20, 30, 40], // периодический урон огнём
      profList: { l: 3 },
      bonusCost: [10, 20, 30],
      branch: 'barrage',
    });
  }

  run() {
    const { initiator, target, game } = this.params;
    if (!initiator.weapon.isOfType(this.weaponTypes)) {
      throw new CastError('NO_WEAPON');
    }

    const initiatorSkillLvl = initiator.skills[this.name] || 1;
    const burnDmg = this.effect[initiatorSkillLvl - 1] ?? 20;

    const { min, max } = initiator.stats.val('hit');
    const hit = MiscService.randFloat(min, max);
    this.status.effect = floatNumber(hit * initiator.proc);

    target.affects.addLongEffect({
      action: burning.name,
      duration: 2,
      proc: initiator.proc,
      initiator,
      value: burnDmg,
      onCast(gameCtx, affect) {
        if (target.stats.val('hp') <= 0) return;
        initiator.proc = this.proc;
        burning.duration = this.duration;
        burning.cast(initiator, target, gameCtx, affect.value);
      },
    });

    effectService.damage(this.context, this);
    this.calculateExp();
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} использовал ${italic(this.displayName)} по ${bold(args.target.nick)} нанеся *${args.effect}* урона`;
  }
}

export const fireArrow = new FireArrow();
export default fireArrow;
