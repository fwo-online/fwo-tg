import type {
  BaseAction,
  BaseActionContext,
  BaseActionParams,
} from '@/arena/Constuructors/BaseAction';
import { Magic } from '@/arena/Constuructors/MagicConstructor';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import CastError from '@/arena/errors/CastError';

class DeathEcho extends PassiveSkillConstructor {
  constructor() {
    super({
      name: 'deathEcho',
      displayName: 'Отголосок смерти',
      description: 'Отголосок смерти цепляется за тебя, истощая силы и удачу.',
      chance: [5, 10, 25, 50],
      effect: [10, 25, 50, 90],
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
        deathEcho.onBeforeAction(ctx, action);
      },
      onCast(params) {
        deathEcho.onCast(params);
      },
    });
  }

  isActive(): boolean {
    return true;
  }

  getChance() {
    return this.chance[0];
  }

  onCast({ initiator, target, game }: BaseActionParams) {
    this.createContext(initiator, target, game);
    const effect = 1 - this.getEffect() / 100;

    initiator.stats.mul('magic.attack', effect);
    initiator.stats.mul('magic.defence', effect);
    initiator.stats.mul('phys.attack', effect);
    initiator.stats.mul('phys.defence', effect);
  }

  onBeforeAction(ctx: BaseActionContext, action: BaseAction) {
    if (!(action instanceof Magic)) {
      return;
    }

    const { initiator, target, game } = ctx.params;
    this.createContext(initiator, target, game);

    if (this.checkChance()) {
      throw new CastError(this.getSuccessResult({ initiator, target, game }));
    }
  }
}

export const deathEcho = new DeathEcho();
