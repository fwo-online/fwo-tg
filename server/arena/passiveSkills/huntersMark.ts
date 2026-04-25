import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import { markedShot } from '@/arena/passiveSkills/markedShot';

class HuntersMark extends PassiveSkillConstructor {
  weaponTypes = ['range'];

  constructor() {
    super({
      name: 'huntersMark',
      displayName: '🎯 Метка охотника',
      description: 'Атака по цели имеет шанс пометить цель, следующая атака наносит больше урона',
      chance: [33, 50, 75],
      effect: [10, 25, 50],
      bonusCost: [],
    });
  }

  run() {
    const { initiator } = this.params;

    initiator.affects.addPassive({
      action: huntersMark.name,
      initiator,
      value: 0,
      onDamageDealt(ctx, action) {
        huntersMark.onDamageDealt(ctx, action);
      },
    });
  }

  onDamageDealt(ctx: BaseActionContext, action: BaseAction) {
    const { initiator, target, game } = ctx.params;
    this.createContext(initiator, target, game);

    if (action.actionType !== 'phys') {
      return;
    }

    if (!initiator.weapon.isOfType(this.weaponTypes)) {
      return;
    }

    if (!this.isActive()) {
      return;
    }

    if (!this.checkChance()) {
      return;
    }

    target.affects.addLongEffect({
      action: this.name,
      proc: initiator.proc,
      duration: 2,
      initiator,
      value: this.getEffect({ initiator, target, game }),
      onBeforeDamageRecieve(ctx, action, affect) {
        markedShot.onBeforeDamageRecieve(ctx, action, affect);
      },
    });

    ctx.addAffect(this, { initiator, target, game });
  }
}

export const huntersMark = new HuntersMark();
