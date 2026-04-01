import { OrderType } from '@fwo/shared';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { CommonMagic } from '@/arena/Constuructors/CommonMagicConstructor';
import { LongMagic } from '@/arena/Constuructors/LongMagicConstructor';
import type { MagicArgs } from '@/arena/Constuructors/MagicConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import CastError from '@/arena/errors/CastError';
import { bold, italic } from '@/utils/formatString';

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

    target.effects.addEffect({
      action: this.name,
      duration: initiator.stats.val('spellLength'),
      proc: initiator.proc,
      initiator,
      onBeforeRun({ params: { initiator, target, game } }): undefined {
        sleepEffect.duration = this.duration;
        sleepEffect.cast(initiator, target, game);
      },
      onDamageReceived(ctx, action) {
        sleepEffect.onDamageReceived(ctx, action);
      },
    });
  }
}

class SleepEffect extends LongMagic {
  run(): void {
    const { target, game } = this.params;
    const effects = target.effects.getEffectsByAction(this.name);

    if (!effects.length) {
      return;
    }

    throw new CastError(
      effects.map(({ initiator }) =>
        this.getSuccessResult({
          initiator,
          target,
          game,
        }),
      ),
    );
  }

  onDamageReceived({ params: { target } }: BaseActionContext, action: BaseAction) {
    if (action.actionType === 'phys') {
      target.effects.removeEffectsByAction(this.name);
    }
  }

  customMessage({ initiator, target }: SuccessArgs): string {
    return `${bold(initiator.nick)} заклинанием ${italic(this.displayName)} заставил ${bold(target.nick)} заснуть на этот раунд`;
  }
}

export const sleep = new Sleep(params);
export const sleepEffect = new SleepEffect(params);
