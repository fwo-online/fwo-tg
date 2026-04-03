import { OrderType } from '@fwo/shared';
import { CommonMagic } from '@/arena/Constuructors/CommonMagicConstructor';
import type { MagicArgs } from '@/arena/Constuructors/MagicConstructor';
import { LongMagic } from '../Constuructors/LongMagicConstructor';

/**
 * Проклятие
 * Основное описание магии общее требовани есть в конструкторе
 */
const params: MagicArgs = Object.freeze({
  name: 'curse',
  displayName: 'Проклятие',
  desc: 'Понижает атаку и защиту цели',
  cost: 3,
  baseExp: 8,
  costType: 'mp',
  lvl: 1,
  orderType: OrderType.All,
  aoeType: 'target',
  magType: 'bad',
  chance: [100, 100, 100],
  effect: ['1d4+2', '1d3+3', '1d2+4'],
  profList: ['p'],
});

class Curse extends CommonMagic {
  run() {
    const { initiator, target } = this.params;

    target.affects.addEffect({
      action: this.name,
      duration: initiator.stats.val('spellLength'),
      initiator,
      value: 0,
      proc: initiator.proc,
      onCast({ initiator, target, game }) {
        initiator.proc = this.proc;
        curseEffect.duration = this.duration;
        curseEffect.cast(initiator, target, game);
      },
    });
  }
}

export class CurseEffect extends LongMagic {
  run() {
    const { target } = this.params;

    const effect = this.effectVal();
    target.stats.down('phys.attack', effect);
    target.stats.down('phys.defence', effect);
  }
}

export const curse = new Curse(params);
export const curseEffect = new CurseEffect(params);
