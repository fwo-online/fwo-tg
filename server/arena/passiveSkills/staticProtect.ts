import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import CastError from '@/arena/errors/CastError';

class StaticProtect extends PassiveSkillConstructor {
  constructor() {
    super({
      name: 'staticProtect',
      displayName: 'Статичная защита',
      description: 'Пассивный шанс заблокировать атаку',
      chance: [0],
      effect: [0],
      bonusCost: [],
    });
  }

  run() {
    const { initiator } = this.params;

    initiator.affects.addPassive({
      action: this.name,
      initiator,
      value: 0,
      onBeforeDamageRecieve(ctx, action) {
        staticProtect.onBeforeDamageRecieve(ctx, action);
      },
    });
  }

  getChance({ initiator, target } = this.context) {
    const attack = initiator.stats.val('phys.attack') * initiator.proc;
    const protect = target.stats.val('static.defence');

    const ratio = attack / protect;

    const chance = Math.round((1 - Math.exp(-2 * ratio)) * 100);

    console.debug(
      `staticProtect:: chance ${chance}, attack ${attack} protect ${protect} ratio ${ratio}`,
    );

    return chance;
  }

  onBeforeDamageRecieve(ctx: BaseActionContext, action: BaseAction) {
    if (action.actionType !== 'phys') {
      return;
    }
    const { initiator, target, game } = ctx;
    this.createContext(initiator, target, game);

    if (!this.isActive({ initiator: target, target: initiator, game })) {
      return;
    }

    if (!this.checkChance({ initiator: target, target: initiator, game })) {
      throw new CastError(this.getSuccessResult({ initiator: target, target: initiator, game }));
    }
  }
}

export const staticProtect = new StaticProtect();
