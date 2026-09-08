import { EffectType, OrderType, values } from '@fwo/shared';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import CastError from '@/arena/errors/CastError';
import { floatNumber } from '@/utils/floatNumber';
import { bold, italic } from '@/utils/formatString';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';

const weaponTypes = ['range'];

/**
 * 🎯 Бронебойный выстрел
 * Усиливает следующую атаку дальнего боя: стрела пробивает броню цели, игнорируя часть её защиты
 */
class PiercingShot extends Skill {
  constructor() {
    super({
      name: 'piercingShot',
      displayName: '🎯 Бронебойный выстрел',
      desc: 'Усиливает следующую атаку дальнего боя: стрела пробивает блок щитом и игнорирует 40–80% брони цели',
      cost: [12, 14, 16],
      proc: 10,
      baseExp: 25,
      costType: 'en',
      orderType: OrderType.Self,
      aoeType: 'target',
      chance: [75, 85, 95],
      effect: [40, 60, 80],
      profList: { l: 3 },
      bonusCost: [10, 20, 30],
      branch: 'marksman',
      branches: ['marksman'],
    });
  }

  run() {
    const { initiator } = this.params;
    if (!initiator.weapon.isOfType(weaponTypes)) {
      throw new CastError('NO_WEAPON');
    }

    const initiatorSkillLvl = initiator.skills[this.name] || 1;
    const penPercent = this.effect[initiatorSkillLvl - 1] ?? 50;

    initiator.affects.addEffect({
      action: this.name,
      initiator,
      value: penPercent,
      onBeforeDamageDeal(ctx, action, affect) {
        piercingShot.onBeforeDamageDeal(ctx, action, affect);
      },
    });

    this.status.effect = penPercent;
    this.calculateExp();
  }

  onBeforeDamageDeal(ctx: BaseActionContext, action: BaseAction, affect: Affect) {
    if (action.actionType !== 'phys' || !ctx.initiator.weapon.isOfType(weaponTypes)) {
      return;
    }

    // Пробивает блок щитом
    ctx.target.affects.removeEffectsByAction('shieldBlock');

    const penRatio = (affect.value ?? 50) / 100;
    const targetDef = ctx.target.stats.val('phys.defence');
    if (targetDef > 0) {
      const defReduction = floatNumber(targetDef * penRatio);
      ctx.target.stats.down('phys.defence', defReduction);
    }

    const bonus = floatNumber(ctx.status.effect * (penRatio * 0.15));
    ctx.status.effect = floatNumber(ctx.status.effect + bonus);
    values(EffectType).forEach((effectType) => {
      const part = ctx.status.effectParts[effectType];
      if (part) {
        ctx.status.setEffectPart(effectType, floatNumber(part * (1 + penRatio * 0.15)));
      }
    });
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} использовал ${italic(this.displayName)}`;
  }
}

export const piercingShot = new PiercingShot();
export default piercingShot;
