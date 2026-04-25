import { OrderType } from '@fwo/shared';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import { LongMagic } from '@/arena/Constuructors/LongMagicConstructor';
import type { MagicArgs } from '@/arena/Constuructors/MagicConstructor';
import CastError from '@/arena/errors/CastError';

/**
 * Сон
 * Основное описание магии общее требовани есть в конструкторе
 */
const params: MagicArgs = Object.freeze({
  name: 'stun',
  displayName: '💫 Оглушение',
  desc: 'Цель оглушена и не может сделать следующее действие.',
  cost: 16,
  baseExp: 20,
  costType: 'mp',
  lvl: 0,
  orderType: OrderType.Enemy,
  aoeType: 'target',
  magType: 'bad',
  chance: [100, 100, 100],
  profList: ['w', 'l'],
  effect: ['1d1', '1d1', '1d1'],
});

class Stun extends LongMagic {
  isAffect = true;

  onBeforeAction(ctx: BaseActionContext, _action: BaseAction, affect: Affect) {
    const { initiator, game } = ctx;
    this.createContext(affect.initiator, initiator, game);

    const effects = initiator.affects.getEffectsByAction(this.name);

    if (!effects.length) {
      return;
    }

    throw new CastError(
      effects.map(({ initiator }) => this.getSuccessResult({ initiator, target: initiator, game })),
    );
  }

  override checkChance(): undefined {
    //
  }

  run(): void {
    //
  }
}

export const stun = new Stun(params);
