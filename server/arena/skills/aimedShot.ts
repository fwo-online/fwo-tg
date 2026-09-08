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
 * 🎯 Прицельный выстрел
 * Усиливает следующую атаку дальнего боя, значительно увеличивая её урон
 */
class AimedShot extends Skill {
  constructor() {
    super({
      name: 'aimedShot',
      displayName: '🎯 Прицельный выстрел',
      desc: 'Усиливает следующую атаку дальнего боя: наносит повышенный урон и лишает цель возможности уклониться',
      cost: [10, 12, 14],
      proc: 20,
      baseExp: 25,
      costType: 'en',
      orderType: OrderType.Self,
      aoeType: 'target',
      chance: [85, 90, 95],
      effect: [1.25, 1.35, 1.5],
      profList: { l: 2 },
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
    const multiplier = this.effect[initiatorSkillLvl - 1] ?? 1.25;

    initiator.affects.addEffect({
      action: this.name,
      initiator,
      value: multiplier,
      onBeforeDamageDeal(ctx, action, affect) {
        aimedShot.onBeforeDamageDeal(ctx, action, affect);
      },
    });

    this.status.effect = multiplier;
    this.calculateExp();
  }

  onBeforeDamageDeal(ctx: BaseActionContext, action: BaseAction, affect: Affect) {
    if (action.actionType !== 'phys' || !ctx.initiator.weapon.isOfType(weaponTypes)) {
      return;
    }

    // Игнорирует и снимает увёртку цели
    ctx.target.affects.removeEffectsByAction('dodge');

    const mult = affect.value ?? 1.25;
    ctx.status.effect = floatNumber(ctx.status.effect * mult);
    values(EffectType).forEach((effectType) => {
      const part = ctx.status.effectParts[effectType];
      if (part) {
        ctx.status.setEffectPart(effectType, floatNumber(part * mult));
      }
    });
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} использовал ${italic(this.displayName)}`;
  }
}

export const aimedShot = new AimedShot();
export default aimedShot;
