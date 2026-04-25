import { OrderType } from '@fwo/shared';
import { CommonMagic } from '@/arena/Constuructors/CommonMagicConstructor';
import type { MagicArgs } from '@/arena/Constuructors/MagicConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { asleep } from '@/arena/effects';
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

    target.affects.addLongEffect({
      action: asleep.name,
      duration: initiator.stats.val('spellLength'),
      proc: initiator.proc,
      initiator,
      onBeforeAction(ctx, action, affect): undefined {
        affect.initiator.proc = this.proc;
        asleep.duration = this.duration;
        asleep.onBeforeAction(ctx, action, affect);
      },
      onDamageReceived(ctx, action) {
        asleep.onDamageReceived(ctx, action);
      },
    });
  }

  customMessage({ initiator, target }: SuccessArgs): string {
    return `${bold(initiator.nick)} заклинанием ${italic(this.displayName)} заставил ${bold(target.nick)} усыпляет игрока`;
  }
}

export const sleep = new Sleep(params);
