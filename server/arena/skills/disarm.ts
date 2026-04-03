import { OrderType } from '@fwo/shared';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { Skill } from '../Constuructors/SkillConstructor';
import CastError from '../errors/CastError';

/**
 * Обезоруживание
 */
class Disarm extends Skill {
  constructor() {
    super({
      name: 'disarm',
      displayName: '🥊 Обезоруживание',
      desc: 'Обезоруживает противника, не давая ему совершить атаку оружием',
      cost: [12, 13, 14, 15, 16, 17],
      proc: 10,
      baseExp: 20,
      costType: 'en',
      orderType: OrderType.Enemy,
      aoeType: 'target',
      chance: [70, 75, 80, 85, 90, 95],
      effect: [1.1, 1.2, 1.3, 1.4, 1.5, 1.6],
      profList: { w: 3, l: 5 },
      bonusCost: [10, 20, 30, 40, 60, 80],
    });
  }

  run() {
    const { initiator, target } = this.params;
    const initiatorMagicLvl = initiator.skills[this.name];
    const effect = this.effect[initiatorMagicLvl - 1] || 1;
    // изменяем
    const iDex = initiator.stats.val('attributes.dex') * effect;
    const tDex = target.stats.val('attributes.dex');
    if (iDex >= tDex) {
      target.affects.addEffect({
        action: this.name,
        initiator,
        duration: 1,
        value: 0,
        onBeforeAction(ctx, action) {
          disarm.onBeforeAction(ctx, action);
        },
      });

      this.calculateExp();
    } else {
      throw new CastError('SKILL_FAIL');
    }
  }

  onBeforeAction(ctx: BaseActionContext, action: BaseAction) {
    if (action.actionType !== 'phys') {
      return;
    }

    const { initiator: target, game } = ctx.params;
    const effect = target.affects.getEffectsByAction(this.name);

    throw new CastError(
      effect.map(({ initiator }) => this.getSuccessResult({ initiator, target, game })),
    );
  }
}

export const disarm = new Disarm();
