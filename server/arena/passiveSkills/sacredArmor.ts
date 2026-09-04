import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { sacredArmorEffect } from '@/arena/effects';
import { bold, brackets, italic } from '@/utils/formatString';

class SacredArmor extends PassiveSkillConstructor {
  constructor() {
    super({
      name: 'sacredArmor',
      displayName: '🛡️ Священная броня',
      description: 'Успешные атаки оружием укрепляют священную броню, повышая физическую защиту на 1 раунд',
      chance: [50, 75, 100],
      effect: [15, 25, 35],
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
      onDamageDealt(ctx, action) {
        sacredArmor.onDamageDealt(ctx, action);
      },
    });
  }

  onDamageDealt(ctx: BaseActionContext, action: BaseAction) {
    if (action.actionType !== 'phys') {
      return;
    }

    const { initiator, target, game } = ctx.params;
    this.createContext(initiator, target, game);

    if (!this.isActive(ctx)) {
      return;
    }

    if (!this.checkChance(ctx)) {
      return;
    }

    const pdefBonus = this.getEffect(ctx);
    this.status.effect = pdefBonus;

    initiator.affects.addLongEffect({
      action: sacredArmorEffect.name,
      duration: 1,
      proc: initiator.proc,
      initiator,
      value: pdefBonus,
      onBeforeDamageRecieve(receiveCtx, action, affect) {
        sacredArmorEffect.onBeforeDamageRecieve(receiveCtx, action, affect);
      },
    });

    ctx.addAffect(this, this.context);
  }

  customMessage(args: SuccessArgs) {
    return `${italic(args.action)} ${bold(args.initiator.nick)} укрепил броню ${brackets(`🛡️+${args.effect}% защиты`)}`;
  }
}

export const sacredArmor = new SacredArmor();
