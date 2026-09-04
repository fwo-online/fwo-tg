import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { bold, brackets, italic } from '@/utils/formatString';

/**
 * 🛡️ Несокрушимость
 * При критическом снижении здоровья (<30% HP) получаемый урон значительно снижается
 */
class Unyielding extends PassiveSkillConstructor {
  threshold = 0.3;

  constructor() {
    super({
      name: 'unyielding',
      displayName: '🛡️ Несокрушимость',
      description: 'Когда здоровье падает ниже 30%, воин собирает всю волю в кулак, снижая получаемый урон',
      chance: [100, 100, 100],
      effect: [20, 30, 40],
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
        unyielding.onBeforeDamageRecieve(ctx, action);
      },
    });
  }

  onBeforeDamageRecieve(ctx: BaseActionContext, _action: BaseAction) {
    const target = ctx.target;
    const maxHp = target.stats.val('base.hp');
    const curHp = target.stats.val('hp');

    if (maxHp <= 0 || curHp / maxHp >= this.threshold) {
      return;
    }

    this.createContext(target, target, ctx.game);
    if (!this.isActive(this.context)) {
      return;
    }

    const reduction = this.getEffect(this.context);
    ctx.status.effect = Math.max(1, Math.round(ctx.status.effect * (1 - reduction / 100)));
  }

  customMessage(args: SuccessArgs) {
    return `${italic(args.action)} ${bold(args.initiator.nick)} проявил несокрушимость ${brackets(`🛡️-${args.effect}% урона`)}`;
  }
}

export const unyielding = new Unyielding();
