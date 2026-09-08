import { EffectType, OrderType } from '@fwo/shared';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import { poison } from '@/arena/effects';
import { floatNumber } from '@/utils/floatNumber';
import { bold, italic } from '@/utils/formatString';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * 🏹☠️ Отравленная стрела
 * Смазывает следующую атаку дальнего боя смертельным ядом: наносит урон ядом и отравляет цель на 2 раунда
 */
class PoisonArrow extends Skill {
  constructor() {
    super({
      name: 'poisonArrow',
      displayName: '🏹 Отравленная стрела',
      desc: 'Смазывает следующую атаку дальнего боя ядом: наносит дополнительный урон ядом и отравляет цель на 2 раунда',
      cost: [12, 14, 16],
      proc: 10,
      baseExp: 25,
      costType: 'en',
      orderType: OrderType.Self,
      aoeType: 'target',
      chance: [80, 85, 90],
      effect: [20, 30, 40],
      profList: { l: 3 },
      bonusCost: [10, 20, 30],
      branch: 'barrage',
      branches: ['barrage'],
      weaponTypes: ['range'],
    });
  }

  run() {
    const { initiator } = this.params;
    const effect = this.getEffect(initiator);

    initiator.affects.addEffect({
      action: this.name,
      initiator,
      value: effect,
      onBeforeDamageDeal(ctx, action) {
        poisonArrow.onBeforeDamageDeal(ctx, action, this.value);
      },
      onDamageDealt(ctx, action, affect) {
        poisonArrow.onDamageDealt(ctx, action, affect);
      },
    });

    this.status.effect = effect;
    this.calculateExp();
  }

  /**
   * Добавляем огненный урон
   */
  onBeforeDamageDeal(ctx: BaseActionContext, action: BaseAction, value: number) {
    if (action.isOfType('phys') && poisonArrow.checkWeapon(ctx.initiator)) {
      ctx.status.addEffectPart(EffectType.Acid, floatNumber(value));
    }
  }

  /**
   * Добавляем горение
   */
  onDamageDealt(ctx: BaseActionContext, action: BaseAction, affect: Affect) {
    if (action.isOfType('phys') && poisonArrow.checkWeapon(ctx.initiator)) {
      const { initiator, target } = ctx;

      target.affects.addLongEffect({
        action: poison.name,
        duration: 2,
        proc: initiator.proc,
        initiator,
        value: affect.value,
        onCast(game) {
          initiator.proc = this.proc;
          poison.duration = this.duration;
          poison.cast(initiator, target, game);
        },
      });
    }
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} использовал ${italic(this.displayName)}`;
  }
}

export const poisonArrow = new PoisonArrow();
export default poisonArrow;
