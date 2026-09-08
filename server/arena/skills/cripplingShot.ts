import { OrderType } from '@fwo/shared';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import CastError from '@/arena/errors/CastError';
import { floatNumber } from '@/utils/floatNumber';
import { bold, italic } from '@/utils/formatString';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';

const weaponTypes = ['range'];

/**
 * 🎯 Выстрел в колено
 * «Когда-то и меня вела дорога приключений, а потом мне прострелили колено...»
 * Усиливает следующую атаку дальнего боя: сбивает увёртку цели, снижает её ловкость на 25–45% и лишает возможности уклоняться на 2 раунда.
 */
class CripplingShot extends Skill {
  constructor() {
    super({
      name: 'cripplingShot',
      displayName: '🎯 Выстрел в колено',
      desc: '«Когда-то и меня вела дорога приключений, а потом мне прострелили колено...» Усиливает атаку дальнего боя: сбивает увёртку, снижает ловкость цели на 25–45% и блокирует уклонение на 2 раунда',
      cost: [12, 14, 16],
      proc: 10,
      baseExp: 25,
      costType: 'en',
      orderType: OrderType.Self,
      aoeType: 'target',
      chance: [80, 85, 90],
      effect: [25, 35, 45],
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
    const debuffPercent = this.effect[initiatorSkillLvl - 1] ?? 25;

    initiator.affects.addEffect({
      action: this.name,
      initiator,
      value: debuffPercent,
      onBeforeDamageDeal(ctx, action, affect) {
        cripplingShot.onBeforeDamageDeal(ctx, action, affect);
      },
      onDamageDealt(ctx, action, affect) {
        cripplingShot.onDamageDealt(ctx, action, affect);
      },
    });

    this.status.effect = debuffPercent;
    this.calculateExp();
  }

  onBeforeDamageDeal(ctx: BaseActionContext, action: BaseAction, affect: Affect) {
    if (action.actionType !== 'phys' || !ctx.initiator.weapon.isOfType(weaponTypes)) {
      return;
    }

    // Сбивает текущую увёртку цели
    ctx.target.affects.removeEffectsByAction('dodge');
  }

  onDamageDealt(ctx: BaseActionContext, action: BaseAction, affect: Affect) {
    if (action.actionType !== 'phys' || !ctx.initiator.weapon.isOfType(weaponTypes)) {
      return;
    }

    const { initiator, target } = ctx;
    if (target.stats.val('hp') <= 0) {
      return;
    }

    const debuffPercent = affect.value ?? 25;
    const curDex = target.stats.val('attributes.dex');
    const dexReduction = floatNumber(curDex * (debuffPercent / 100));
    target.stats.down('attributes.dex', dexReduction);

    target.affects.addLongEffect({
      action: cripplingShot.name,
      duration: 2,
      initiator,
      value: debuffPercent,
      onBeforeAction(actionCtx, actionToCast) {
        if (actionToCast.name === 'dodge') {
          throw new CastError('SKILL_FAIL');
        }
      },
    });
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} использовал ${italic(this.displayName)}`;
  }
}

export const cripplingShot = new CripplingShot();
export default cripplingShot;
