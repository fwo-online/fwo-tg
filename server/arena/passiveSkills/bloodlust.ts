import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { bold, brackets, italic } from '@/utils/formatString';

/**
 * 🪓 Жажда битвы
 * При добивании противника восстанавливает энергию и часть здоровья
 */
class Bloodlust extends PassiveSkillConstructor {
  constructor() {
    super({
      name: 'bloodlust',
      displayName: '🪓 Жажда битвы',
      description: 'При убийстве противника воин наполняется яростью, восстанавливая энергию и здоровье',
      chance: [100, 100, 100],
      effect: [10, 20, 30],
      bonusCost: [10, 20, 30],
      branch: 'berserker',
    });
  }

  run() {
    const { initiator } = this.params;

    initiator.affects.addPassive({
      action: this.name,
      initiator,
      value: 0,
      onDamageDealt(ctx, action) {
        bloodlust.onDamageDealt(ctx, action);
      },
    });
  }

  onDamageDealt(ctx: BaseActionContext, _action: BaseAction) {
    const { initiator, target, game } = ctx.params;
    this.createContext(initiator, target, game);

    if (!this.isActive(ctx)) {
      return;
    }

    if (target.stats.val('hp') <= 0) {
      const effectVal = this.getEffect(ctx);
      const enGain = effectVal;
      const maxHp = initiator.stats.val('base.hp');
      const hpGain = Math.max(1, Math.round(maxHp * (effectVal / 200)));

      initiator.stats.up('en', enGain);
      initiator.stats.up('hp', hpGain);

      this.status.effect = enGain;
      ctx.addAffect(this, this.context);
    }
  }

  customMessage(args: SuccessArgs) {
    return `${italic(args.action)} ${bold(args.initiator.nick)} утолил жажду битвы ${brackets(`⚡+${args.effect} EN`)}`;
  }
}

export const bloodlust = new Bloodlust();
