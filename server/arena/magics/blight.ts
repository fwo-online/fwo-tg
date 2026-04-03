import { OrderType } from '@fwo/shared';
import { CommonMagic } from '@/arena/Constuructors/CommonMagicConstructor';
import type { DmgMagicArgs } from '@/arena/Constuructors/DmgMagicConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { bold, italic } from '@/utils/formatString';
import { LongDmgMagic } from '../Constuructors/LongDmgMagicConstructor';

/**
 * Истощение
 * Основное описание магии общее требовани есть в конструкторе
 */
const params: DmgMagicArgs = Object.freeze({
  name: 'blight',
  displayName: 'Истощение',
  desc: 'Истощает цель, заставляя ей терять жизни.',
  cost: 14,
  baseExp: 8,
  costType: 'mp',
  lvl: 4,
  orderType: OrderType.Enemy,
  aoeType: 'target',
  magType: 'bad',
  chance: [92, 94, 95],
  effect: ['1d10+5', '1d10+10', '1d10+15'],
  dmgType: 'physical',
  profList: ['m'],
});

class Blight extends CommonMagic {
  run() {
    const { initiator, target } = this.params;

    target.affects.addEffect({
      action: this.name,
      duration: initiator.stats.val('spellLength'),
      proc: initiator.proc,
      initiator,
      value: 0,
      onCast({ initiator, target, game }) {
        initiator.proc = this.proc;
        blightEffect.duration = this.duration;
        blightEffect.cast(initiator, target, game);
      },
    });
  }
}

class BlightEffect extends LongDmgMagic {
  run() {
    const { target } = this.params;
    const hp = target.stats.val('hp');
    const effectVal = this.effectVal();
    const hit = hp * (effectVal / 100);

    this.status.effect = hit;
    target.stats.down('hp', hit);
  }

  customMessage(args: SuccessArgs): string {
    return `${bold(args.target.nick)} ${italic`истощён`} ${args.initiator.nick} и теряет ${args.effect} здоровья`;
  }
}

export const blightEffect = new BlightEffect(params);
export const blight = new Blight(params);
