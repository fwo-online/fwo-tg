import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { concussion } from '@/arena/effects/concussion';
import { bold, italic } from '@/utils/formatString';

class WeightyArgument extends PassiveSkillConstructor {
  constructor() {
    super({
      name: 'weightyArgument',
      displayName: 'Веский аргумент',
      description:
        'Физическое попадание оружием дробящего типа (stun) с шансом накладывает Контузию на 2 раунда',
      chance: [10, 15, 20],
      effect: [10, 20, 25],
      profList: { w: 1 },
      bonusCost: [10, 20, 30],
      branch: 'guardian',
      weaponTypes: ['stun'],
      actionTypes: ['phys'],
    });
  }

  run() {
    const { initiator } = this.params;
    initiator.affects.addPassive({
      action: this.name,
      initiator,
      onDamageDealt(ctx, action) {
        weightyArgument.onDamageDealt(ctx, action);
      },
    });
  }

  onDamageDealt(ctx: BaseActionContext, action: BaseAction) {
    if (!(ctx.status.effect > 0)) {
      return;
    }
    if (ctx.target.affects.getEffectsByAction(concussion.name).length > 0) {
      return;
    }
    if (!this.canTrigger(ctx, action)) {
      return;
    }
    const { initiator, target, game } = ctx;
    const value = this.getEffect(ctx);

    target.affects.addLongEffect({
      action: concussion.name,
      initiator,
      value,
      duration: 2,
      onCast: (game, affect) => {
        concussion.castLongEffect(initiator, target, game, affect);
      },
    });

    const affect = target.affects.getEffectsByAction(concussion.name).at(-1);

    affect?.onCast?.(game, affect);

    ctx.addAffect(this, this.context);
  }

  customMessage(args: SuccessArgs) {
    return `${italic(this.displayName)}: ${bold(args.target.nick)} получает ${italic(concussion.displayName)}`;
  }
}

export const weightyArgument = new WeightyArgument();
