import { OrderType } from '@fwo/shared';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { Magic, type MagicArgs } from '@/arena/Constuructors/MagicConstructor';
import { CommonMagic } from '../Constuructors/CommonMagicConstructor';
import CastError from '../errors/CastError';

/**
 * Безмолвие
 * Основное описание магии общее требовани есть в конструкторе
 */
const params: MagicArgs = Object.freeze({
  name: 'silence',
  displayName: 'Безмолвие',
  desc: '',
  cost: 16,
  baseExp: 80,
  costType: 'mp',
  lvl: 4,
  orderType: OrderType.All,
  aoeType: 'target',
  magType: 'bad',
  chance: ['1d60+30', '1d30+55', '1d10+75'],
  profList: ['m'],
  effect: [],
});

class Silence extends CommonMagic {
  run() {
    const { initiator, target } = this.params;

    target.affects.addEffect({
      action: this.name,
      proc: initiator.proc,
      initiator,
      onBeforeAction({ params: { initiator, target, game } }) {
        return silence.cast(initiator, target, game);
      },
    });
  }

  onBeforeAction(ctx: BaseActionContext, action: BaseAction) {
    if (!(action instanceof Magic)) {
      return;
    }

    const { initiator: target, game } = ctx.params;
    const effects = target.affects.getEffectsByAction(this.name);

    if (!effects.length) {
      return;
    }

    throw new CastError(
      effects.map(({ initiator }) => this.getSuccessResult({ initiator, target, game })),
    );
  }
}

export const silence = new Silence(params);
