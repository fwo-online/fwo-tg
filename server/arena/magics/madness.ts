import { type ActionType, OrderType } from '@fwo/shared';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import type { MagicArgs } from '@/arena/Constuructors/MagicConstructor';
import { CommonMagic } from '../Constuructors/CommonMagicConstructor';
import type { Affect } from '../Constuructors/interfaces/Affect';

/**
 * Безумие
 * Основное описание магии общее требовани есть в конструкторе
 */
const params: MagicArgs = Object.freeze({
  name: 'madness',
  displayName: 'Безумие',
  desc: 'Заставляет цель атаковать саму себя',
  cost: 10,
  baseExp: 80,
  costType: 'mp',
  lvl: 2,
  orderType: OrderType.Enemy,
  aoeType: 'target',
  magType: 'bad',
  chance: ['1d10+75', '1d20+80', '1d20+85'],
  profList: ['m'],
  effect: [],
});

class Madness extends CommonMagic {
  run() {
    const { initiator, target } = this.params;
    target.affects.addEffect({
      action: this.name,
      duration: 1,
      value: 0,
      initiator,
      proc: initiator.proc,
      onBeforeAction(ctx, action, affect) {
        return madnessEffect.onBeforeAction(ctx, action, affect);
      },
    });
  }
}

const actionTypes: ActionType[] = ['phys'];

class MadnessEffect extends CommonMagic {
  isAffect = true;

  run(): void {}

  onBeforeAction(ctx: BaseActionContext, action: BaseAction, affect: Affect) {
    if (!actionTypes.includes(action.actionType)) {
      return;
    }

    const { initiator, game } = ctx.params;

    ctx.params.target = initiator;

    ctx.status.affects.push(
      this.getSuccessResult({
        initiator: affect.initiator,
        target: initiator,
        game,
      }),
    );
  }
}

export const madnessEffect = new MadnessEffect(params);
export const madness = new Madness(params);
