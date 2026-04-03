import { OrderType } from '@fwo/shared';
import type { BaseActionContext } from '@/arena/Constuructors/BaseAction';
import type { MagicArgs } from '@/arena/Constuructors/MagicConstructor';
import { CommonMagic } from '../Constuructors/CommonMagicConstructor';

import CastError from '../errors/CastError';

/**
 * Паралич
 * Основное описание магии общее требовани есть в конструкторе
 */
const params: MagicArgs = Object.freeze({
  name: 'paralysis',
  displayName: 'Паралич',
  desc: 'Парализует цель',
  cost: 8,
  baseExp: 80,
  costType: 'mp',
  lvl: 2,
  orderType: OrderType.Enemy,
  aoeType: 'target',
  magType: 'bad',
  chance: ['1d80+20', '1d40+60', '1d20+80'],
  profList: ['p'],
  effect: [],
});

class Paralysis extends CommonMagic {
  run() {
    const { initiator, target } = this.params;
    target.affects.addEffect({
      action: this.name,
      duration: 1,
      initiator,
      value: 0,
      onBeforeAction(ctx) {
        paralysis.onBeforeAction(ctx);
      },
    });
  }

  onBeforeAction(ctx: BaseActionContext) {
    const { initiator: target, game } = ctx.params;

    const effects = target.affects.getEffectsByAction(this.name);

    throw new CastError(
      effects.map(({ initiator }) => this.getSuccessResult({ initiator, target, game })),
    );
  }
}

export const paralysis = new Paralysis(params);
