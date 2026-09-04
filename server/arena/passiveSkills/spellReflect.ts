import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { Magic } from '@/arena/Constuructors/MagicConstructor';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { effectService } from '@/arena/EffectService';
import { bold, brackets, italic } from '@/utils/formatString';

class SpellReflect extends PassiveSkillConstructor {
  constructor() {
    super({
      name: 'spellReflect',
      displayName: '🪞 Отражение чар',
      description: 'Шанс отразить направленное заклинание врага прямо обратно в него',
      chance: [10, 18, 25],
      effect: [100, 100, 100],
      bonusCost: [10, 20, 30],
      branch: 'protection',
    });
  }

  run() {
    const { initiator } = this.params;

    initiator.affects.addPassive({
      action: this.name,
      initiator,
      value: 0,
      onBeforeDamageRecieve(ctx, action) {
        spellReflect.onBeforeDamageRecieve(ctx, action);
      },
    });
  }

  onBeforeDamageRecieve(ctx: BaseActionContext, action: BaseAction) {
    const isMagic = action instanceof Magic;

    if (!isMagic) {
      return;
    }

    const { initiator: attacker, target: defender, game } = ctx.params;
    this.createContext(defender, attacker, game);

    if (!this.isActive(this.context)) {
      return;
    }

    if (!this.checkChance(this.context)) {
      return;
    }

    const reflectedDamage = ctx.status.effect;
    ctx.status.effect = 0; // Поглощаем урон
    this.status.effect = reflectedDamage;

    effectService.rawDamage(this.context, this);

    ctx.addAffect(this, this.context);
  }

  customMessage(args: SuccessArgs) {
    return `${italic(args.action)} ${bold(args.initiator.nick)} отразил заклинание в ${bold(args.target.nick)} ${brackets(`🪞 Отражено: ${args.effect}`)}`;
  }
}

export const spellReflect = new SpellReflect();
