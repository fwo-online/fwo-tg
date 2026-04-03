import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import { bleeding } from '@/arena/magics';

class Lacerate extends PassiveSkillConstructor {
  weaponTypes = ['cut'];

  constructor() {
    super({
      name: 'lacerate',
      displayName: '🩸Рассечение',
      description: 'Шанс на 🩸Кровотечение при атаке режущим оружием',
      chance: [15, 20, 30],
      effect: [1, 1, 1],
      bonusCost: [],
    });
  }

  run() {
    const { initiator } = this.params;

    initiator.affects.addPassive({
      action: lacerate.name,
      initiator,
      value: 0,
      onDamageDealt(ctx, action) {
        lacerate.onDamageDealt(ctx, action);
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
      action: 'bleeding',
      duration: initiator.stats.val('spellLength'),
      proc: initiator.proc,
      initiator,
      onCast({ initiator, target, game }) {
        initiator.proc = this.proc;
        bleeding.duration = this.duration;
        bleeding.cast(initiator, target, game);
      },
    });

    ctx.status.affects.push(this.getSuccessResult({ initiator, target, game }));
  }
}

export const lacerate = new Lacerate();
