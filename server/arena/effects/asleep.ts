import { type ActionType, OrderType } from '@fwo/shared';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import { LongMagic } from '@/arena/Constuructors/LongMagicConstructor';
import type { MagicArgs } from '@/arena/Constuructors/MagicConstructor';
import CastError from '@/arena/errors/CastError';

const actionTypes: ActionType[] = ['phys', 'protect', 'heal', 'skill'];

/**
 * 💤 Сон
 * Основное описание магии общее требовани есть в конструкторе
 */
const params: MagicArgs = Object.freeze({
  name: 'asleep',
  displayName: '💤 Сон',
  desc: 'Цель засыпает магическим сном и не может: атаковать, лечить, защищать, использовать скиллы',
  cost: 0,
  baseExp: 20,
  costType: 'mp',
  lvl: 0,
  orderType: OrderType.Enemy,
  aoeType: 'target',
  magType: 'bad',
  chance: ['1d80+20', '1d40+60', '1d20+80'],
  profList: ['m'],
  effect: ['1d1', '1d1', '1d1'],
});

class Asleep extends LongMagic {
  isAffect = true;

  onBeforeAction(ctx: BaseActionContext, action: BaseAction, affect: Affect) {
    if (actionTypes.includes(action.actionType)) {
      const { initiator, game } = ctx.params;
      this.cast(affect.initiator, initiator, game);
    }
  }

  run(): void {
    const { target, game } = this.params;
    const effects = target.affects.getEffectsByAction(this.name);

    if (!effects.length) {
      return;
    }

    throw new CastError(
      effects.map(({ initiator }) => this.getSuccessResult({ initiator, target, game })),
    );
  }

  onDamageReceived({ params: { target } }: BaseActionContext, action: BaseAction) {
    if (action.actionType === 'phys') {
      target.affects.removeEffectsByAction(this.name);
    }
  }
}

export const asleep = new Asleep(params);
