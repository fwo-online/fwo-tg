import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { ActionType, SuccessArgs } from '@/arena/Constuructors/types';
import { italic } from '@/utils/formatString';

class CriticalStrike extends PassiveSkillConstructor {
  constructor() {
    super({
      name: 'criticalStrike',
      displayName: '🎯 Двойной урон',
      description: 'Атака оружием дальнего боя имеет шанс нанести двойной урон',
      profList: { l: 1 },
      chance: [10, 15, 20, 25, 30, 35],
      effect: [100, 100, 100, 100, 100, 100],
      bonusCost: [10, 20, 30, 40, 60, 80],
      weaponTypes: ['range'],
      actionTypes: ['phys'],
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
    if (!this.canTrigger(ctx, action) || !action.effectType) {
      return;
    }

    ctx.status.mulEffectPart(action.effectType, 2);

    ctx.addAffect(this, this.context);
  }

  customMessage(args: SuccessArgs) {
    return `${italic(args.action)}`;
  }
}

export const criticalStrike = new CriticalStrike();
