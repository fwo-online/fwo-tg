import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { floatNumber } from '@/utils/floatNumber';
import { italic } from '@/utils/formatString';

class CriticalStrike extends PassiveSkillConstructor {
  weaponTypes = ['range'];

  constructor() {
    super({
      name: 'criticalStrike',
      displayName: '🎯 Двойной урон',
      description: 'Атака оружием дальнего боя имеет шанс нанести двойной урон',
      profList: { l: 1 },
      chance: [10, 15, 20, 25, 30, 35],
      effect: [100, 100, 100, 100, 100, 100],
      bonusCost: [10, 20, 30, 40, 60, 80],
    });
  }

  run() {
    const { initiator } = this.params;

    initiator.affects.addPassive({
      action: this.name,
      initiator,
      value: 0,
      onBeforeDamageDeal(ctx, action) {
        criticalStrike.onBeforeDamageDeal(ctx, action);
      },
    });
  }

  onBeforeDamageDeal(ctx: BaseActionContext, action: BaseAction) {
    if (action.actionType !== 'phys') {
      return;
    }

    const { initiator, target, game } = ctx.params;
    this.createContext(initiator, target, game);

    if (!initiator.weapon.isOfType(this.weaponTypes)) {
      return;
    }

    if (!this.isActive(ctx)) {
      return;
    }

    if (!this.checkChance(ctx)) {
      return;
    }

    ctx.status.effect = floatNumber(ctx.status.effect * 2);

    ctx.addAffect(this, this.context);
  }

  customMessage(args: SuccessArgs) {
    return `${italic(args.action)}`;
  }
}

export const criticalStrike = new CriticalStrike();
