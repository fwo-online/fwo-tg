import { EffectType } from '@fwo/shared';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { frostbite } from '@/arena/effects';
import { bold, brackets, italic } from '@/utils/formatString';

class FrostBite extends PassiveSkillConstructor {
  constructor() {
    super({
      name: 'frostBite',
      displayName: '❄️ Окоченение',
      description:
        'Атаки оружием и заклинания холода замедляют цель, снижая её атаку и ловкость на 2 раунда',
      chance: [30, 40, 50],
      effect: [10, 18, 25],
      bonusCost: [10, 20, 30],
      branch: 'elements',
    });
  }

  run() {
    const { initiator } = this.params;

    initiator.affects.addPassive({
      action: this.name,
      initiator,
      value: 0,
      onDamageDealt(ctx, action) {
        frostBite.onDamageDealt(ctx, action);
      },
    });
  }

  onDamageDealt(ctx: BaseActionContext, action: BaseAction) {
    const isFrost = action.effectType === EffectType.Frost;
    const isWeaponAttack = action.actionType === 'phys';

    if (!isFrost && !isWeaponAttack) {
      return;
    }

    const { initiator, target } = ctx.params;
    this.createContext(initiator, target, ctx.game);

    if (!this.isActive(ctx)) {
      return;
    }

    if (!this.checkChance(ctx)) {
      return;
    }

    const slowPercent = this.getEffect(ctx);
    this.status.effect = slowPercent;

    target.affects.addLongEffect({
      action: frostbite.name,
      duration: 2,
      proc: initiator.proc,
      initiator,
      value: slowPercent,
      onBeforeDamageDeal(dealCtx, action, affect) {
        frostbite.onBeforeDamageDeal(dealCtx, action, affect);
      },
    });

    ctx.addAffect(this, this.context);
  }

  customMessage(args: SuccessArgs) {
    return `${italic(args.action)} ${bold(args.initiator.nick)} сковал холодом ${bold(args.target.nick)} ${brackets(`❄️-${args.effect}% атаки`)}`;
  }
}

export const frostBite = new FrostBite();
