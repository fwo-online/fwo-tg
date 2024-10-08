import { bold } from '../../utils/formatString';
import { CommonMagic } from '../Constuructors/CommonMagicConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * Каменная кожа
 * Основное описание магии общее требовани есть в конструкторе
 */

class StoneSkin extends CommonMagic {
  constructor() {
    super({
      name: 'stoneSkin',
      displayName: 'Каменная кожа',
      desc: 'Превращает кожу цели в камень',
      cost: 3,
      baseExp: 6,
      costType: 'mp',
      lvl: 1,
      orderType: 'all',
      aoeType: 'target',
      magType: 'good',
      chance: [100, 100, 100],
      effect: ['1d4+2', '1d3+3', '1d2+4'],
      profList: ['p'],
    });
  }

  run() {
    const { target } = this.params;
    target.stats.up('def', this.effectVal());
  }

  // eslint-disable-next-line class-methods-use-this
  customMessage(args: SuccessArgs) {
    const { initiator, target, effect } = args;
    const effectStr = effect?.toString() || '';
    return `${bold(initiator.nick)} превращяет кожу ${bold(target.nick)} в камень усиливая защиту на ${bold(effectStr)}`;
  }
}

export default new StoneSkin();
