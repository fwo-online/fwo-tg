import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import CastError from '@/arena/errors/CastError';

class NightCall extends PassiveSkillConstructor {
  constructor() {
    super({
      name: 'nightcall',
      displayName: '🌕Зов ночи',
      description: 'Даёт имунитет к усыплению',
      chance: [100],
      effect: [],
      bonusCost: [],
    });
  }

  run() {
    const { initiator } = this.params;
    initiator.affects.addPassive({
      action: this.name,
      initiator,
      value: 0,
      onBeforeAction(ctx, action) {
        nightcall.onBeforeAction(ctx, action);
      },
    });
  }

  onBeforeAction(ctx: BaseActionContext, action: BaseAction) {
    if (action.name !== 'sleep') {
      return;
    }

    const { initiator, target, game } = ctx.params;
    this.createContext(initiator, target, game);

    throw new CastError({
      ...this.getSuccessResult({ initiator, target, game }),
      actionType: 'passive',
    });
  }
}

export const nightcall = new NightCall();
