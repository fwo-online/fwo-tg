import { OrderType } from '@fwo/shared';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { LongMagic } from '@/arena/Constuructors/LongMagicConstructor';
import type { MagicArgs } from '@/arena/Constuructors/MagicConstructor';
import CastError from '@/arena/errors/CastError';
import { ProtectConstructor } from '../Constuructors/ProtectConstructor';

/**
 * Магическая стена
 * Основное описание магии общее требовани есть в конструкторе
 */
const params: MagicArgs = Object.freeze({
  name: 'magicWall',
  displayName: 'Магическая стена',
  desc: 'Защищает цель, цель не может атаковать, нельзя использовать на себя',
  cost: 30,
  baseExp: 0.1,
  costType: 'mp',
  lvl: 4,
  orderType: OrderType.TeamExceptSelf,
  aoeType: 'target',
  magType: 'good',
  chance: [100, 100, 100],
  profList: ['p'],
  effect: ['1d25+125', '1d50+150', '1d100+200'],
});

class MagicWall extends LongMagic {
  run(): void {
    const { initiator, target } = this.params;
    const value = this.effectVal();
    target.stats.up('phys.defence', value);
    this.duration = initiator.stats.val('spellLength');

    target.affects.addLongEffect({
      action: this.name,
      initiator,
      value,
      duration: this.duration,
      proc: initiator.proc,
      onBeforeDamageRecieve(ctx, action) {
        magicWallEffect.onBeforeDamageRecieve(ctx, action);
      },
      onBeforeDamageDeal(ctx, action) {
        magicWall.onBeforeDamageDeal(ctx, action);
      },
    });
  }

  onBeforeDamageDeal(ctx: BaseActionContext, action: BaseAction) {
    if (action.actionType !== 'phys') {
      return;
    }
    const { initiator, game } = ctx.params;
    const effects = initiator.affects.getEffectsByAction(this.name);

    throw new CastError(
      effects.map(({ initiator: wallCaster }) =>
        this.getSuccessResult({ initiator: wallCaster, target: initiator, game }),
      ),
    );
  }
}

class MagicWallEffect extends ProtectConstructor {
  name = params.name;
  displayName = params.displayName;
  orderType = params.orderType;

  run() {}
}

export const magicWall = new MagicWall(params);
export const magicWallEffect = new MagicWallEffect();
