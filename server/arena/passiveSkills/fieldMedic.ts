import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import {
  type PassiveSkillAttributes,
  PassiveSkillConstructor,
} from '@/arena/Constuructors/PassiveSkillConstructor';
import type { BreaksMessage, SuccessArgs } from '@/arena/Constuructors/types';
import { bold, italic } from '@/utils/formatString';

/**
 * 🏃 Полевой медик
 * Опыт выживания в суровых условиях: усиливает «Лечение руками» на 30–60%
 * и предотвращает его прерывание физическими атаками противников
 */
const params: PassiveSkillAttributes = {
  name: 'fieldMedic',
  displayName: '🏃 Полевой медик',
  description: 'Усиливает «Лечение руками» на 30–60% и защищает его от прерывания атаками врагов',
  chance: [100, 100, 100],
  effect: [30, 45, 60],
  profList: { l: 1 },
  bonusCost: [10, 20, 30],
  branch: 'scout',
  branches: ['scout'],
  actionTypes: ['heal'],
};

class FieldMedic extends PassiveSkillConstructor {
  run() {
    const { initiator } = this.params;

    initiator.affects.addPassive({
      action: this.name,
      initiator,
      value: 0,
      onBeforeHealDeal(ctx, action) {
        fieldMedicBuff.onBeforeHealDeal(ctx, action);
      },
      onCastFail(ctx, action, reason) {
        return fieldMedic.onCastFail(ctx, action, reason);
      },
    });
  }

  onCastFail(
    ctx: BaseActionContext,
    action: BaseAction,
    _reason: SuccessArgs | SuccessArgs[] | BreaksMessage,
  ) {
    if (this.canTrigger(ctx, action)) {
      return ctx.addAffect(this, this.context);
    }
  }

  customMessage(args: SuccessArgs) {
    return `${italic(this.displayName)}: ${bold(args.initiator.nick)} завершил исцеление вопреки атакам врага`;
  }
}

class FieldMedicBuff extends PassiveSkillConstructor {
  run(): void {
    //
  }

  onBeforeHealDeal(ctx: BaseActionContext, action: BaseAction) {
    if (this.canTrigger(ctx, action)) {
      ctx.status.effect *= 1 + this.getEffect(this.context) / 100;
      ctx.addAffect(this, ctx);
    }
  }

  customMessage(args: SuccessArgs) {
    const initiatorSkillLvl = args.initiator.getPassiveSkillLevel(this.name);
    const effect = this.effect[initiatorSkillLvl - 1];
    return `${italic(this.displayName)}: ${bold(args.initiator.nick)} 💖+${effect}%`;
  }
}

export const fieldMedic = new FieldMedic(params);
export const fieldMedicBuff = new FieldMedicBuff(params);
export default fieldMedic;
