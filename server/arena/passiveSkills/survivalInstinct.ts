import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { bold, brackets, italic } from '@/utils/formatString';

/**
 * 🏃 Инстинкт выживания
 * Когда здоровье падает ниже 35%, обострённые рефлексы позволяют избегать значительной части урона
 */
class SurvivalInstinct extends PassiveSkillConstructor {
  threshold = 0.35;

  constructor() {
    super({
      name: 'survivalInstinct',
      displayName: '🏃 Инстинкт выживания',
      description: 'Когда здоровье падает ниже 35%, инстинкты обостряются, снижая входящий урон',
      chance: [100, 100, 100],
      effect: [25, 35, 50],
      bonusCost: [10, 20, 30],
      branch: 'scout',
    });
  }

  run() {
    const { initiator } = this.params;

    initiator.affects.addPassive({
      action: this.name,
      initiator,
      value: 0,
      onBeforeDamageRecieve(ctx, action) {
        survivalInstinct.onBeforeDamageRecieve(ctx, action);
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
    return `${italic(args.action)} ${bold(args.initiator.nick)} спасся благодаря инстинктам ${brackets(`🏃-${args.effect}% урона`)}`;
  }
}

export const survivalInstinct = new SurvivalInstinct();
