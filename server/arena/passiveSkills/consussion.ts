import type { BaseAction } from '@/arena/Constuructors/BaseAction';
import type { BaseActionContext } from '@/arena/Constuructors/BaseActionContext';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import { stun } from '@/arena/effects';

class Consussion extends PassiveSkillConstructor {
  weaponTypes = ['stun'];

  constructor() {
    super({
      name: 'consussion',
      displayName: 'Сотрясение',
      description: 'Шанс оглушить цель, заставляя её пропустить следующее действие',
      chance: [10, 15, 25],
      effect: [100, 100, 100],
      bonusCost: [],
    });
  }

  run() {
    const { initiator } = this.params;

    initiator.affects.addPassive({
      action: consussion.name,
      initiator,
      value: 0,
      onDamageDealt(ctx, action) {
        consussion.onDamageDealt(ctx, action);
      },
    });
  }

  onDamageDealt(ctx: BaseActionContext, action: BaseAction) {
    if (action.actionType !== 'phys') {
      return;
    }

    const { initiator, target, game } = ctx.params;

    if (!ctx.initiator.weapon.isOfType(this.weaponTypes)) {
      return;
    }

    if (!this.isActive(ctx) || !this.checkChance(ctx)) {
      return;
    }

    target.affects.addEffect({
      action: stun.name,
      initiator,
      onBeforeAction(ctx, action, affect) {
        stun.onBeforeAction(ctx, action, affect);
      },
    });

    ctx.status.affects.push(this.getSuccessResult({ initiator, target, game }));
  }
}

export const consussion = new Consussion();
