import { OrderType } from '@fwo/shared';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import { bold, italic } from '@/utils/formatString';
import { Skill } from '../Constuructors/SkillConstructor';
import type { BreaksMessage, SuccessArgs } from '../Constuructors/types';
import { hasReasonActionType } from '../Constuructors/utils';

/**
 * 🎯 Прицельный выстрел
 * Усиливает следующую атаку дальнего боя, значительно увеличивая её урон
 */
class AimedShot extends Skill {
  constructor() {
    super({
      name: 'aimedShot',
      displayName: '🎯 Прицельный выстрел',
      desc: 'Усиливает следующую атаку дальнего боя: наносит повышенный урон и игнорирует увёртку цели',
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
      weaponTypes: ['range'],
    });
  }

  run() {
    const { initiator } = this.params;
    const multiplier = this.getEffect(initiator);

    initiator.affects.addEffect({
      action: this.name,
      initiator,
      value: multiplier,
      onBeforeDamageDeal(ctx, action, affect) {
        aimedShot.onBeforeDamageDeal(ctx, action, affect);
      },
      onCastFail(ctx, action, reason) {
        return aimedShot.onCastFail(ctx, action, reason);
      },
    });

    this.status.effect = multiplier;
    this.calculateExp();
  }

  onBeforeDamageDeal(ctx: BaseActionContext, action: BaseAction, affect: Affect) {
    if (action.actionType !== 'phys' || !this.checkWeapon(ctx.initiator)) {
      return;
    }

    const mult = affect.value ?? 1.25;
    ctx.status.mulEffect(mult);

    ctx.initiator.affects.removeEffectsByAction(this.name);
  }

  onCastFail(
    ctx: BaseActionContext,
    action: BaseAction,
    reason: SuccessArgs | SuccessArgs[] | BreaksMessage,
  ): boolean {
    if (action.actionType !== 'phys' || !this.checkWeapon(ctx.initiator)) {
      return false;
    }

    return hasReasonActionType(reason, 'dodge');
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} использовал ${italic(this.displayName)}`;
  }
}

export const aimedShot = new AimedShot();
export default aimedShot;
