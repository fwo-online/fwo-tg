import { type ActionType, OrderType } from '@fwo/shared';
import { BaseAction, type BaseActionContext } from '@/arena/Constuructors/BaseAction';
import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import CastError from '@/arena/errors/CastError';
import type { Player } from '@/arena/PlayersService';
import { floatNumber } from '@/utils/floatNumber';
import { bold, italic } from '@/utils/formatString';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';

export class CripplingShotDebuff extends BaseAction {
  name = 'cripplingShot' as const;
  displayName = '🎯 Выстрел в колено';
  actionType: ActionType = 'skill';
  orderType: OrderType = OrderType.Enemy;
  isAffect = true;

  apply(target: Player, initiator: Player, debuffPercent: number) {
    if (target.stats.val('hp') <= 0) {
      return;
    }

    this.applyDebuff(target, debuffPercent);

    target.affects.addLongEffect({
      action: this.name,
      duration: 2,
      initiator,
      value: debuffPercent,
      onCast: (_game, affect) => {
        this.onCast(target, affect);
      },
      onBeforeAction: (actionCtx, actionToCast, affect) => {
        this.onBeforeAction(actionCtx, actionToCast, affect);
      },
    });
  }

  applyDebuff(target: Player, debuffPercent: number) {
    if (target.stats.val('hp') <= 0) {
      return;
    }

    const curDex = target.stats.val('attributes.dex');
    const dexReduction = floatNumber(curDex * (debuffPercent / 100));
    target.stats.down('attributes.dex', dexReduction);
  }

  onCast(target: Player, affect: Affect) {
    this.applyDebuff(target, affect.value ?? 25);
  }

  onBeforeAction(actionCtx: BaseActionContext, actionToCast: BaseAction, affect?: Affect) {
    if (actionToCast.name === 'dodge') {
      const { initiator: target, game } = actionCtx;
      const caster = affect?.initiator ?? this.params?.initiator;
      this.createContext(caster, target, game);
      throw new CastError(this.getSuccessResult(this.context));
    }
  }

  cast(): void {
    //
  }

  run(): void {
    //
  }
}

export const cripplingShotDebuff = new CripplingShotDebuff();

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

  onBeforeDamageDeal(ctx: BaseActionContext, action: BaseAction, _affect?: Affect) {
    // Сбивает текущую увёртку цели
    if (action.isOfType('phys') && this.checkWeapon(ctx.initiator)) {
      ctx.target.affects.removeEffectsByAction('dodge');
    }
  }

  onDamageDealt(ctx: BaseActionContext, action: BaseAction, affect: Affect) {
    if (action.isOfType('phys') && this.checkWeapon(ctx.initiator)) {
      const { initiator, target } = ctx;
      const debuffPercent = affect.value ?? 25;
      cripplingShotDebuff.apply(target, initiator, debuffPercent);
    }
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} использовал ${italic(this.displayName)}`;
  }
}

export const cripplingShot = new CripplingShot();
export default cripplingShot;
