import { EffectType } from '@fwo/shared';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { corpsePoison } from '@/arena/effects';
import { bold, brackets, italic } from '@/utils/formatString';

class Virulence extends PassiveSkillConstructor {
  constructor() {
    super({
      name: 'virulence',
      displayName: '🧪 Трупный яд',
      description:
        'Атаки оружием и урон кислотой отравляют цель трупным ядом, нанося периодический урон',
      chance: [35, 50, 65],
      effect: [0.25, 0.35, 0.45],
      bonusCost: [10, 20, 30],
      branch: 'darkness',
    });
  }

  run() {
    const { initiator } = this.params;

    initiator.affects.addPassive({
      action: this.name,
      initiator,
      value: 0,
      onDamageDealt(ctx, action) {
        virulence.onDamageDealt(ctx, action);
      },
    });
  }

  onDamageDealt(ctx: BaseActionContext, action: BaseAction) {
    if (action.name === corpsePoison.name) {
      return;
    }

    const isAcid = action.effectType === EffectType.Acid;
    const isWeaponAttack = action.actionType === 'phys';

    if (!isAcid && !isWeaponAttack) {
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

    const poisonDamage = Math.max(1, Math.round(ctx.status.effect * this.getEffect(ctx)));
    this.status.effect = poisonDamage;

    target.affects.addLongEffect({
      action: corpsePoison.name,
      duration: 2,
      proc: initiator.proc,
      initiator,
      value: poisonDamage,
      onCast(game, affect) {
        if (target.stats.val('hp') <= 0) return;
        initiator.proc = this.proc;
        corpsePoison.duration = this.duration;
        corpsePoison.cast(initiator, target, game, affect.value);
      },
    });

    ctx.addAffect(this, this.context);
  }

  customMessage(args: SuccessArgs) {
    return `${italic(args.action)} ${bold(args.initiator.nick)} отравил ${bold(args.target.nick)} ${brackets(`🧪${args.effect}/ход`)}`;
  }
}

export const virulence = new Virulence();
