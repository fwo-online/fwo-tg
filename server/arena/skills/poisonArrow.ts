import { EffectType, OrderType } from '@fwo/shared';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import { poison } from '@/arena/effects';
import CastError from '@/arena/errors/CastError';
import { floatNumber } from '@/utils/floatNumber';
import { bold, italic } from '@/utils/formatString';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';

const weaponTypes = ['range'];

/**
 * 🏹☠️ Отравленная стрела
 * Смазывает следующую атаку дальнего боя смертельным ядом: наносит урон ядом и отравляет цель на 2 раунда
 */
class PoisonArrow extends Skill {
  constructor() {
    super({
      name: 'poisonArrow',
      displayName: '🏹 Отравленная стрела',
      desc: 'Смазывает следующую атаку дальнего боя ядом: наносит дополнительный урон ядом и отравляет цель на 2 раунда',
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
    const poisonDmg = this.effect[initiatorSkillLvl - 1] ?? 20;

    initiator.affects.addEffect({
      action: this.name,
      initiator,
      value: poisonDmg,
      onBeforeDamageDeal(ctx, action, affect) {
        if (action.actionType === 'phys' && ctx.initiator.weapon.isOfType(weaponTypes)) {
          const acidBonus = floatNumber((affect.value ?? 20) * 0.5);
          ctx.status.effect = floatNumber(ctx.status.effect + acidBonus);
          const curAcid = ctx.status.effectParts[EffectType.Acid] ?? 0;
          ctx.status.setEffectPart(EffectType.Acid, floatNumber(curAcid + acidBonus));
        }
      },
      onDamageDealt(ctx, action, affect) {
        if (action.actionType === 'phys' && ctx.initiator.weapon.isOfType(weaponTypes)) {
          poisonArrow.applyPoison(ctx, affect);
        }
      },
    });

    this.status.effect = poisonDmg;
    this.calculateExp();
  }

  applyPoison(ctx: BaseActionContext, affect: Affect) {
    const { initiator, target } = ctx;
    if (target.stats.val('hp') <= 0) return;

    target.affects.addLongEffect({
      action: poison.name,
      duration: 2,
      proc: initiator.proc,
      initiator,
      value: affect.value,
      onCast(gameCtx, a) {
        if (target.stats.val('hp') <= 0) return;
        initiator.proc = this.proc;
        poison.duration = this.duration;
        poison.cast(initiator, target, gameCtx);
      },
    });
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} использовал ${italic(this.displayName)}`;
  }
}

export const poisonArrow = new PoisonArrow();
export default poisonArrow;
