import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { effectService } from '@/arena/EffectService';
import { floatNumber } from '@/utils/floatNumber';
import { bold, italic } from '@/utils/formatString';

/**
 * 🗡️ Контрудар
 * При получении физического удара дуэлянт с шансом наносит немедленный ответный удар
 */
class Riposte extends PassiveSkillConstructor {
  private lock = false;

  constructor() {
    super({
      name: 'riposte',
      displayName: '🗡️ Контрудар',
      description: 'При получении физического удара дуэлянт с шансом совершает мгновенную контратаку',
      chance: [40, 60, 80],
      effect: [30, 50, 70],
      bonusCost: [10, 20, 30],
      branch: 'duelist',
    });
  }

  run() {
    const { initiator } = this.params;

    initiator.affects.addPassive({
      action: this.name,
      initiator,
      value: 0,
      onDamageReceived(ctx, action) {
        riposte.onDamageReceived(ctx, action);
      },
    });
  }

  onDamageReceived(ctx: BaseActionContext, action: BaseAction) {
    if (this.lock) {
      return;
    }

    if (action.actionType !== 'phys') {
      return;
    }

    const { initiator: attacker, target: defender, game } = ctx;
    this.createContext(defender, attacker, game);

    if (!this.isActive(this.context)) {
      return;
    }

    if (!this.checkChance(this.context)) {
      return;
    }

    const counterPercent = this.getEffect(this.context);
    const counterDmg = floatNumber(ctx.status.effect * (counterPercent / 100));

    if (counterDmg <= 0 || attacker.stats.val('hp') <= 0) {
      return;
    }

    const counterCtx = ctx.cloneWith(attacker);
    counterCtx.status.effect = counterDmg;

    try {
      this.lock = true;
      effectService.rawDamage(counterCtx, this);
      this.status.effect = counterDmg;
      ctx.addAffect(this, this.context);
    } finally {
      this.lock = false;
    }
  }

  customMessage(args: SuccessArgs) {
    return `${italic(args.action)} ${bold(args.initiator.nick)} провёл контрудар по ${bold(args.target.nick)} нанеся *${args.effect}* урона`;
  }
}

export const riposte = new Riposte();
