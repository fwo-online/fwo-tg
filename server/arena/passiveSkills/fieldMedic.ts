import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { BreaksMessage, SuccessArgs } from '@/arena/Constuructors/types';
import { floatNumber } from '@/utils/floatNumber';
import { bold, brackets, italic } from '@/utils/formatString';

/**
 * 🏃 Полевой медик
 * Опыт выживания в суровых условиях: усиливает «Лечение руками» на 30–60%
 * и предотвращает его прерывание физическими атаками противников
 */
class FieldMedic extends PassiveSkillConstructor {
  constructor() {
    super({
      name: 'fieldMedic',
      displayName: '🏃 Полевой медик',
      description: 'Усиливает «Лечение руками» на 30–60% и защищает его от прерывания атаками врагов',
      chance: [100, 100, 100],
      effect: [30, 45, 60],
      profList: { l: 1 },
      bonusCost: [10, 20, 30],
      branch: 'scout',
      branches: ['scout'],
    });
  }

  run() {
    const { initiator } = this.params;

    initiator.affects.addPassive({
      action: this.name,
      initiator,
      value: 0,
      onBeforeAction(ctx, action) {
        fieldMedic.onBeforeAction(ctx, action);
      },
      onCastFail(ctx, action, reason) {
        return fieldMedic.onCastFail(ctx, action, reason);
      },
    });
  }

  onBeforeAction(ctx: BaseActionContext, action: BaseAction) {
    if (action.name !== 'handsHeal') {
      return;
    }

    const { initiator, target, game } = ctx.params;
    this.createContext(initiator, target, game);

    if (!this.isActive(this.context)) {
      return;
    }

    const bonusPercent = this.getEffect(this.context) ?? 30;
    const healVal = initiator.stats.val('heal');
    const bonusMin = floatNumber(healVal.min * (bonusPercent / 100));
    const bonusMax = floatNumber(healVal.max * (bonusPercent / 100));

    initiator.stats.up('heal.min', bonusMin);
    initiator.stats.up('heal.max', bonusMax);
  }

  onCastFail(
    ctx: BaseActionContext,
    action: BaseAction,
    _reason: SuccessArgs | SuccessArgs[] | BreaksMessage,
  ): boolean {
    if (action.actionType !== 'heal') {
      return false;
    }

    const { initiator, target, game } = ctx.params;
    this.createContext(initiator, target, game);

    if (!this.isActive(this.context)) {
      return false;
    }

    ctx.addAffect(this, this.context);
    return true;
  }

  customMessage(args: SuccessArgs) {
    return `${italic(this.displayName)}: ${bold(args.initiator.nick)} завершил исцеление вопреки атакам врага ${brackets(`💚+${args.effect}%`)}`;
  }
}

export const fieldMedic = new FieldMedic();
export default fieldMedic;
