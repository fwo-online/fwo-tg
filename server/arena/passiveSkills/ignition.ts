import { EffectType } from '@fwo/shared';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { burning } from '@/arena/effects';
import { bold, brackets, italic } from '@/utils/formatString';

class Ignition extends PassiveSkillConstructor {
  constructor() {
    super({
      name: 'ignition',
      displayName: '🔥 Воспламенение',
      description:
        'Атаки оружием и заклинания огня с шансом поджигают цель, нанося периодический урон огнём',
      chance: [30, 40, 50],
      effect: [0.2, 0.3, 0.4],
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
        ignition.onDamageDealt(ctx, action);
      },
    });
  }

  onDamageDealt(ctx: BaseActionContext, action: BaseAction) {
    if (action.name === burning.name) {
      return;
    }

    const isFire = action.effectType === EffectType.Fire;
    const isWeaponAttack = action.actionType === 'phys';

    if (!isFire && !isWeaponAttack) {
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

    const burnDamage = Math.max(1, Math.round(ctx.status.effect * this.getEffect(ctx)));
    this.status.effect = burnDamage;

    target.affects.addLongEffect({
      action: burning.name,
      duration: 2,
      proc: initiator.proc,
      initiator,
      value: burnDamage,
      onCast(game, affect) {
        if (target.stats.val('hp') <= 0) return;
        initiator.proc = this.proc;
        burning.duration = this.duration;
        burning.cast(initiator, target, game, affect.value);
      },
    });

    ctx.addAffect(this, this.context);
  }

  customMessage(args: SuccessArgs) {
    return `${italic(args.action)} ${bold(args.initiator.nick)} поджёг ${bold(args.target.nick)} ${brackets(`🔥${args.effect}/ход`)}`;
  }
}

export const ignition = new Ignition();
