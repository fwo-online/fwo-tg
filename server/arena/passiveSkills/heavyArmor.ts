import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { bold, brackets, italic } from '@/utils/formatString';

/**
 * 🛡️ Закалённая броня
 * Пассивно снижает получаемый физический урон
 */
class HeavyArmor extends PassiveSkillConstructor {
  constructor() {
    super({
      name: 'heavyArmor',
      displayName: '🛡️ Закалённая броня',
      description: 'Тяжёлая броня закалена в боях, постоянно снижая получаемый физический урон',
      chance: [100, 100, 100],
      effect: [15, 25, 35],
      bonusCost: [10, 20, 30],
      branch: 'guardian',
    });
  }

  run() {
    const { initiator } = this.params;

    initiator.affects.addPassive({
      action: this.name,
      initiator,
      value: 0,
      onBeforeDamageRecieve(ctx, action) {
        heavyArmor.onBeforeDamageRecieve(ctx, action);
      },
    });
  }

  onBeforeDamageRecieve(ctx: BaseActionContext, action: BaseAction) {
    if (action.actionType !== 'phys') {
      return;
    }

    const { initiator } = this.params;
    if (!this.isActive(ctx)) {
      return;
    }

    const reduction = this.getEffect(ctx);
    ctx.status.effect = Math.max(1, Math.round(ctx.status.effect * (1 - reduction / 100)));
  }

  customMessage(args: SuccessArgs) {
    return `${italic(args.action)} ${bold(args.initiator.nick)} смягчил удар бронёй ${brackets(`🛡️-${args.effect}% урона`)}`;
  }
}

export const heavyArmor = new HeavyArmor();
