import { EffectType, OrderType } from '@fwo/shared';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import { burning } from '@/arena/effects';
import CastError from '@/arena/errors/CastError';
import { floatNumber } from '@/utils/floatNumber';
import { bold, italic } from '@/utils/formatString';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';

const weaponTypes = ['range'];

/**
 * 🏹🔥 Зажигательная стрела
 * Заряжает следующую атаку дальнего боя огненной смесью: атака наносит урон огнём и поджигает цель на 2 раунда
 */
class FireArrow extends Skill {
  constructor() {
    super({
      name: 'fireArrow',
      displayName: '🏹 Зажигательная стрела',
      desc: 'Заряжает следующую атаку дальнего боя огнём: наносит дополнительный урон огнём и поджигает цель на 2 раунда',
      cost: [12, 14, 16],
      proc: 10,
      baseExp: 25,
      costType: 'en',
      orderType: OrderType.Self,
      aoeType: 'target',
      chance: [80, 85, 90],
      effect: [20, 30, 40],
      profList: { l: 3 },
      bonusCost: [10, 20, 30],
      branch: 'barrage',
      branches: ['barrage'],
    });
  }

  run() {
    const { initiator } = this.params;
    if (!initiator.weapon.isOfType(weaponTypes)) {
      throw new CastError('NO_WEAPON');
    }

    const initiatorSkillLvl = initiator.skills[this.name] || 1;
    const burnDmg = this.effect[initiatorSkillLvl - 1] ?? 20;

    initiator.affects.addEffect({
      action: this.name,
      initiator,
      value: burnDmg,
      onBeforeDamageDeal(ctx, action, affect) {
        if (action.actionType === 'phys' && ctx.initiator.weapon.isOfType(weaponTypes)) {
          const fireBonus = floatNumber((affect.value ?? 20) * 0.5);
          ctx.status.effect = floatNumber(ctx.status.effect + fireBonus);
          const curFire = ctx.status.effectParts[EffectType.Fire] ?? 0;
          ctx.status.setEffectPart(EffectType.Fire, floatNumber(curFire + fireBonus));
        }
      },
      onDamageDealt(ctx, action, affect) {
        if (action.actionType === 'phys' && ctx.initiator.weapon.isOfType(weaponTypes)) {
          fireArrow.applyBurning(ctx, affect);
        }
      },
    });

    this.status.effect = burnDmg;
    this.calculateExp();
  }

  applyBurning(ctx: BaseActionContext, affect: Affect) {
    const { initiator, target } = ctx;
    if (target.stats.val('hp') <= 0) return;

    target.affects.addLongEffect({
      action: burning.name,
      duration: 2,
      proc: initiator.proc,
      initiator,
      value: affect.value,
      onCast(gameCtx, a) {
        if (target.stats.val('hp') <= 0) return;
        initiator.proc = this.proc;
        burning.duration = this.duration;
        burning.cast(initiator, target, gameCtx, a.value);
      },
    });
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} использовал ${italic(this.displayName)}`;
  }
}

export const fireArrow = new FireArrow();
export default fireArrow;
