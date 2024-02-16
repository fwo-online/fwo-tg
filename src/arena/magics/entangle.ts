import { bold } from '../../utils/formatString';
import { CommonMagic } from '../Constuructors/CommonMagicConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * Опутывание
 * Основное описание магии общее требовани есть в конструкторе
 */
class Entangle extends CommonMagic {
  constructor() {
    super({
      name: 'entangle',
      displayName: 'Опутывание',
      desc: 'Уменьшает защиту цели.',
      cost: 3,
      baseExp: 6,
      costType: 'mp',
      lvl: 1,
      orderType: 'enemy',
      aoeType: 'target',
      magType: 'bad',
      chance: [100, 100, 100],
      effect: ['1d2+4', '1d2+5', '1d2+6'],
      profList: ['p'],
    });
  }

  run() {
    const { target } = this.params;
    target.stats.mode('down', 'pdef', this.effectVal());
  }

  // eslint-disable-next-line class-methods-use-this
  customMessage(args: SuccessArgs) {
    const { initiator, target, effect } = args;
    const effectStr = effect?.toString() || '';
    return `${bold(initiator)} опутывает ${bold(target)} снижая защиту на ${bold(effectStr)}pt`;
  }
}

export default new Entangle();
