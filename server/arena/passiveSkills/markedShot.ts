import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';

class MarkedShot extends PassiveSkillConstructor {
  weaponTypes = ['range'];

  constructor() {
    super({
      name: 'markedShot',
      displayName: '🏹 Выстрел по метке',
      description: 'Выстрел по метке наносит больше урона',
      chance: [],
      effect: [],
      bonusCost: [],
      actionTypes: ['phys'],
    });
  }

  run() {
    //
  }

  override checkChance() {
    return true;
  }

  override isActive() {
    return true;
  }

  onBeforeDamageRecieve(ctx: BaseActionContext, action: BaseAction, affect: Affect) {
    if (!this.canTrigger(ctx, action) || !action.effectType) {
      return;
    }

    if (affect.initiator !== ctx.params.initiator) {
      return;
    }

    ctx.status.mulEffectPart(action.effectType, 1 + (affect.value ?? 1) / 100);

    ctx.addAffect(this, this.context);
  }
}

export const markedShot = new MarkedShot();
