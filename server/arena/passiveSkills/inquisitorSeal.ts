import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { silence } from '@/arena/magics';
import { bold, italic } from '@/utils/formatString';

class InquisitorSeal extends PassiveSkillConstructor {
  constructor() {
    super({
      name: 'inquisitorSeal',
      displayName: '⚖️ Печать инквизитора',
      description:
        'Атаки оружием сжигают ману или энергию цели, а также имеют шанс наложить безмолвие',
      chance: [15, 20, 25],
      effect: [8, 15, 25],
      bonusCost: [10, 20, 30],
      branch: 'inquisition',
    });
  }

  run() {
    const { initiator } = this.params;

    initiator.affects.addPassive({
      action: this.name,
      initiator,
      value: 0,
      onDamageDealt(ctx, action) {
        inquisitorSeal.onDamageDealt(ctx, action);
      },
    });
  }

  onDamageDealt(ctx: BaseActionContext, action: BaseAction) {
    const isPhysical = action.actionType === 'phys';
    const isInquisitionSpell = action.isInBranch('inquisition');

    if (!isPhysical && !isInquisitionSpell) {
      return;
    }

    const { initiator, target, game } = ctx.params;
    this.createContext(initiator, target, game);

    if (!this.isActive(ctx)) {
      return;
    }

    const burnAmount = this.getEffect(ctx);
    this.status.effect = burnAmount;

    // Сжигаем MP (если есть) или EN
    const targetMp = target.stats.val('mp');
    if (targetMp > 0) {
      target.stats.down('mp', burnAmount);
    } else {
      target.stats.down('en', burnAmount);
    }

    // Проверка шанса наложения безмолвия (Silence)
    if (this.checkChance(ctx)) {
      target.affects.addEffect({
        action: silence.name,
        initiator,
        onBeforeAction(actionCtx, targetAction) {
          silence.onBeforeAction(actionCtx, targetAction);
        },
      });
    }

    ctx.addAffect(this, this.context);
  }

  customMessage(args: SuccessArgs) {
    return `${italic(args.action)} ${bold(args.initiator.nick)} выжег ${args.effect} энергии/маны у ${bold(args.target.nick)}`;
  }
}

export const inquisitorSeal = new InquisitorSeal();
