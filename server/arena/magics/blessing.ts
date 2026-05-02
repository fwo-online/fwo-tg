import { OrderType } from '@fwo/shared';
import { LongMagic } from '@/arena/Constuructors/LongMagicConstructor';
import type { MagicArgs } from '@/arena/Constuructors/MagicConstructor';
import { bold } from '@/utils/formatString';
import { CommonMagic } from '../Constuructors/CommonMagicConstructor';
import type { SuccessArgs } from '../Constuructors/types';

const longLevel = 3;

/**
 * Благословение
 * Основное описание магии общее требовани есть в конструкторе
 */
const params: MagicArgs = Object.freeze({
  name: 'blessing',
  displayName: 'Благословение',
  desc: `Благословляет цель увеличивая её физические параметры. На ${longLevel} уровне становится длительной, увеличивая параметры цели в течение нескольких ходов`,
  cost: 3,
  baseExp: 8,
  costType: 'mp',
  lvl: 1,
  orderType: OrderType.All,
  aoeType: 'target',
  magType: 'good',
  chance: [100, 100, 100],
  effect: ['1d4+2', '1d3+3', '1d2+4'],
  profList: ['p'],
});

class Blessing extends CommonMagic {
  run() {
    const { initiator, target, game } = this.params;
    const magicLvl = initiator.getMagicLevel(this.name);

    if (magicLvl >= longLevel) {
      target.affects.addLongEffect({
        action: this.name,
        duration: initiator.stats.val('spellLength'),
        proc: initiator.proc,
        initiator,
        onCast(game) {
          initiator.proc = this.proc;
          blessingEffect.duration = this.duration;
          blessingEffect.cast(initiator, target, game);
        },
      });
    } else {
      blessingEffect.duration = 0;
      blessingEffect.cast(initiator, target, game);
    }
  }
}

class BlessingEffect extends LongMagic {
  run() {
    const { target } = this.params;
    const value = this.effectVal();
    target.stats.up('phys.attack', value);
    target.stats.up('phys.defence', value);
  }

  customMessage({ effect, initiator, target }: SuccessArgs) {
    const effectStr = effect?.toString() || '';
    return `${bold(initiator.nick)} благословляет ${bold(target.nick)}, увеличивая его атаку и защиту на ${bold(effectStr)}`;
  }
}

export const blessingEffect = new BlessingEffect(params);
export const blessing = new Blessing(params);
