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
      effect: [10, 20, 30],
      profList: { l: 1 },
      bonusCost: [10, 20, 30],
      branch: 'marksman',
      branches: ['marksman', 'scout'],
      weaponTypes: ['range'],
      actionTypes: ['phys'],
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
    const { initiator, target } = ctx.params;

    if (this.canTrigger(ctx, action)) {
      target.affects.addLongEffect({
        action: this.name,
        proc: initiator.proc,
        duration: 2,
        initiator,
        value: this.getEffect(ctx),
        onBeforeDamageRecieve(ctx, action, affect) {
          initiator.proc = this.proc;
          markedShot.onBeforeDamageRecieve(ctx, action, affect);
        },
      });

      ctx.addAffect(this, this.context);
    }
  }
}

export const huntersMark = new HuntersMark();
