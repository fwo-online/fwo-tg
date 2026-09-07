import { type EffectType, keys } from '@fwo/shared';
import { isEmptyObject } from 'es-toolkit';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import type { Player } from '@/arena/PlayersService';
import { floatNumber } from '@/utils/floatNumber';

export class EffectService {
  rawDamage(ctx: BaseActionContext, action: BaseAction) {
    this.applyDamage(ctx, action);

    ctx.target.affects.onDamageReceived(ctx, action);
    ctx.initiator.affects.onDamageDealt(ctx, action);

    return ctx.status.effect;
  }

  damage(ctx: BaseActionContext, action: BaseAction) {
    ctx.initiator.affects.onBeforeDamageDeal(ctx, action);
    ctx.initiator.affects.withOnCastFail(
      () => ctx.target.affects.onBeforeDamageRecieve(ctx, action),
      ctx,
      action,
    );

    this.applyDamage(ctx, action);

    ctx.target.affects.onDamageReceived(ctx, action);
    ctx.initiator.affects.onDamageDealt(ctx, action);

    return ctx.status.effect;
  }

  private applyDamage(ctx: BaseActionContext, action: BaseAction) {
    this.applyResists(ctx, action);

    ctx.status.effect = floatNumber(ctx.status.effect);
    ctx.target.stats.down('hp', ctx.status.effect);

    this.checkTargetIsDead(ctx.target, ctx, action);
  }

  heal(ctx: BaseActionContext) {
    const maxHP = ctx.target.stats.val('base.hp');
    const currentHP = ctx.target.stats.val('hp');
    ctx.status.effect = floatNumber(Math.max(Math.min(ctx.status.effect, maxHP - currentHP), 0));

    this.applyHeal(ctx.target, ctx.status.effect);

    return ctx.status.effect;
  }

  lifesteal(ctx: BaseActionContext, action: BaseAction) {
    const maxHeal = ctx.target.stats.val('hp');

    const damage = this.damage(ctx, action);
    const max = Math.max(Math.min(maxHeal, damage), 0);

    if (max > 0) {
      this.applyHeal(ctx.initiator, floatNumber(Math.min(max, ctx.status.effect)));
    }

    return ctx.status.effect;
  }

  private applyHeal(target: Player, effect: number) {
    target.stats.up('hp', effect);

    this.checkTargetIsAlive(target);
  }

  private applyResists(ctx: BaseActionContext, action: BaseAction) {
    /** @todo перейти на геттер для effect для умений наносящих урон */
    if (isEmptyObject(ctx.status.effectParts)) {
      if (action?.effectType) {
        ctx.status.effect *= this.getResist(ctx.target, action.effectType);
      }
    } else {
      keys(ctx.status.effectParts).forEach((effectType) => {
        const effect = ctx.status.effectParts[effectType];
        if (effect) {
          ctx.status.setEffectPart(effectType, effect * this.getResist(ctx.target, effectType));
        }
      });
    }
  }

  private getResist(target: Player, type: EffectType): number {
    return target.stats.val('resists')[type] ?? 1;
  }

  private checkTargetIsDead(target: Player, ctx: BaseActionContext, action: BaseAction) {
    if (target.stats.val('hp') <= 0 && !target.getKiller()) {
      target.setKiller(ctx.initiator, action.displayName);
    }
  }

  private checkTargetIsAlive(target: Player) {
    if (target.stats.val('hp') > 0 && target.getKiller()) {
      target.resetKiller();
    }
  }
}

export const effectService = new EffectService();
