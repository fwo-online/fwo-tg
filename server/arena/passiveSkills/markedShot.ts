import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import { floatNumber } from '@/utils/floatNumber';

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
    });
  }

  run() {
    //
  }

  onBeforeAction(ctx: BaseActionContext, action: BaseAction, affect: Affect) {
    if (action.actionType !== 'phys') {
      return;
    }

    if (affect.initiator !== ctx.params.initiator) {
      return;
    }

    const { initiator, target, game } = ctx.params;
    this.createContext(initiator, target, game);

    ctx.status.effect += floatNumber((ctx.status.effect * (affect.value ?? 1)) / 100);

    ctx.addAffect(this, { initiator, target, game });
  }
}

export const markedShot = new MarkedShot();
