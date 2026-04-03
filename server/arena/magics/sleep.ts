import { type ActionType, OrderType } from '@fwo/shared';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { CommonMagic } from '@/arena/Constuructors/CommonMagicConstructor';
import { LongMagic } from '@/arena/Constuructors/LongMagicConstructor';
import type { MagicArgs } from '@/arena/Constuructors/MagicConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import CastError from '@/arena/errors/CastError';
import { bold, italic } from '@/utils/formatString';

const actionTypes: ActionType[] = ['phys', 'protect', 'heal', 'skill'];
/**
 * Сон
 * Основное описание магии общее требовани есть в конструкторе
 */
const params: MagicArgs = Object.freeze({
  name: 'sleep',
  displayName: 'Усыпление',
  desc: 'Цель засыпает магическим сном и не может: атаковать, лечить, защищать, использовать скиллы',
  cost: 16,
  baseExp: 20,
  costType: 'mp',
  lvl: 4,
  orderType: OrderType.Enemy,
  aoeType: 'target',
  magType: 'bad',
  chance: ['1d80+20', '1d40+60', '1d20+80'],
  profList: ['m'],
  effect: ['1d1', '1d1', '1d1'],
});

class Sleep extends CommonMagic {
  run() {
    const { initiator, target } = this.params;

    target.affects.addEffect({
      action: this.name,
      duration: initiator.stats.val('spellLength'),
      proc: initiator.proc,
      initiator,
      onBeforeAction({ status, params: { initiator, game } }, action): undefined {
        this.initiator.proc = this.proc;
        sleepEffect.duration = this.duration;
        sleepEffect.onBeforeAction(
          { params: { initiator: this.initiator, target: initiator, game }, status },
          action,
        );
      },
      onDamageReceived(ctx, action) {
        sleepEffect.onDamageReceived(ctx, action);
      },
    });
  }

  customMessage({ initiator, target }: SuccessArgs): string {
    return `${bold(initiator.nick)} заклинанием ${italic(this.displayName)} заставил ${bold(target.nick)} усыпляет игрока`;
  }
}

class SleepEffect extends LongMagic {
  isAffect = true;

  onBeforeAction(ctx: BaseActionContext, action: BaseAction) {
    if (actionTypes.includes(action.actionType)) {
      const { initiator, target, game } = ctx.params;
      this.cast(initiator, target, game);
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

export const sleep = new Sleep(params);
export const sleepEffect = new SleepEffect(params);
