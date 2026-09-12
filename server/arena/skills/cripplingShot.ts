import { OrderType } from '@fwo/shared';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import CastError from '@/arena/errors/CastError';
import type { Player } from '@/arena/PlayersService';
import { floatNumber } from '@/utils/floatNumber';
import { bold, italic } from '@/utils/formatString';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * 🎯 Выстрел в колено
 * «Когда-то и меня вела дорога приключений, а потом мне прострелили колено...»
 * Усиливает следующую атаку дальнего боя: сбивает увёртку цели, снижает её ловкость на 25–45% и лишает возможности уклоняться на 2 раунда.
 */
export class CripplingShot extends Skill {
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
      weaponTypes: ['range'],
    });
  }

  run() {
    const { initiator } = this.params;
    const debuffPercent = this.getEffect(initiator);

    initiator.affects.addEffect({
      action: this.name,
      initiator,
      value: debuffPercent,
      onBeforeDamageDeal(ctx, action) {
        cripplingShot.onBeforeDamageDeal(ctx, action);
      },
      onDamageDealt(ctx, action) {
        cripplingShot.onDamageDealt(ctx, action, this.value);
      },
    });

    this.status.effect = debuffPercent;
    this.calculateExp();
  }

  onBeforeDamageDeal(ctx: BaseActionContext, action: BaseAction) {
    // Сбивает текущую увёртку цели
    if (action.isOfType('phys') && this.checkWeapon(ctx.initiator)) {
      ctx.target.affects.removeEffectsByAction('dodge');
    }
  }

  onDamageDealt(ctx: BaseActionContext, action: BaseAction, value: number) {
    if (action.isOfType('phys') && this.checkWeapon(ctx.initiator)) {
      const { initiator, target } = ctx;
      this.onCast(target, value);

      target.affects.addLongEffect({
        action: cripplingShot.name,
        duration: 2,
        initiator,
        value,
        onCast() {
          cripplingShot.onCast(target, this.value);
        },
        onBeforeAction(ctx, action, affect) {
          cripplingShot.onBeforeAction(ctx, action, affect);
        },
      });

      ctx.addAffect(this);

      ctx.initiator.affects.removeEffectsByAction(this.name);
    }
  }

  onCast(target: Player, value: number) {
    const dex = target.stats.val('attributes.dex');

    target.stats.down('attributes.dex', floatNumber(dex * (value / 100)));
  }

  onBeforeAction(actionCtx: BaseActionContext, action: BaseAction, affect: Affect) {
    if (action.name === 'dodge') {
      const { initiator: target, game } = actionCtx;
      const initiator = affect?.initiator;
      this.createContext(initiator, target, game);

      throw new CastError(this.getSuccessResult(this.context));
    }
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} использовал ${italic(this.displayName)}`;
  }
}

export const cripplingShot = new CripplingShot();
export default cripplingShot;
