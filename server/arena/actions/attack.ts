import { OrderType } from '@fwo/shared';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { effectService } from '@/arena/EffectService';
import type { Affect } from '../Constuructors/interfaces/Affect';
import PhysConstructor from '../Constuructors/PhysConstructor';
import CastError from '../errors/CastError';

/**
 * Физическая атака
 */
class Attack extends PhysConstructor {
  constructor() {
    super({
      name: 'attack',
      displayName: 'Атака',
      desc: 'Атака',
      lvl: 0,
      orderType: OrderType.All,
    });
  }

  /**
   * Кастомный обработчик атаки
   */
  run() {
    if (!this.params) {
      return;
    }
    const { initiator, target } = this.params;

    target.affects.addEffect({
      action: this.name,
      initiator,
      value: this.status.effect,
      onBeforeAction(ctx, action, affect) {
        attack.onBeforeAction(ctx, action, affect);
      },
    });

    effectService.damage(this.context, this);
  }

  onBeforeAction(ctx: BaseActionContext, action: BaseAction, affect: Affect) {
    if (action.actionType !== 'heal') {
      return;
    }

    const { initiator, game } = ctx.params;
    throw new CastError(
      this.getSuccessResult({ initiator: affect.initiator, target: initiator, game }),
    );
  }
}

export const attack = new Attack();
