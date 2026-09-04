import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { bold, brackets, italic } from '@/utils/formatString';

/**
 * 🎯 Орлиный глаз
 * Пассивно увеличивает урон при стрельбе из лука и арбалета
 */
class EagleEye extends PassiveSkillConstructor {
  weaponTypes = ['range'];

  constructor() {
    super({
      name: 'eagleEye',
      displayName: '🎯 Орлиный глаз',
      description: 'Зоркий глаз лучника выискивает бреши в обороне, постоянно увеличивая урон при стрельбе из лука',
      chance: [100, 100, 100],
      effect: [15, 25, 35],
      bonusCost: [10, 20, 30],
      branch: 'marksman',
    });
  }

  run() {
    const { initiator } = this.params;

    initiator.affects.addPassive({
      action: this.name,
      initiator,
      value: 0,
      onBeforeDamageDeal(ctx, action) {
        eagleEye.onBeforeDamageDeal(ctx, action);
      },
    });
  }

  onBeforeDamageDeal(ctx: BaseActionContext, action: BaseAction) {
    if (action.actionType !== 'phys') {
      return;
    }

    const { initiator } = ctx.params;
    if (!initiator.weapon.isOfType(this.weaponTypes)) {
      return;
    }

    this.createContext(initiator, ctx.target, ctx.game);
    if (!this.isActive(this.context)) {
      return;
    }

    const bonus = this.getEffect(this.context);
    ctx.status.effect = Math.round(ctx.status.effect * (1 + bonus / 100));
  }

  customMessage(args: SuccessArgs) {
    return `${italic(args.action)} ${bold(args.initiator.nick)} поразил цель орлиным глазом ${brackets(`🎯+${args.effect}% урона`)}`;
  }
}

export const eagleEye = new EagleEye();
