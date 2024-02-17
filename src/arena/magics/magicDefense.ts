import { bold } from '../../utils/formatString';
import { CommonMagic } from '../Constuructors/CommonMagicConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * Магическая защита
 * Основное описание магии общее требовани есть в конструкторе
 */
class MagicDefense extends CommonMagic {
  constructor() {
    super({
      name: 'magicDefense',
      displayName: 'Магическая защита',
      desc: '',
      cost: 12,
      baseExp: 40,
      costType: 'mp',
      lvl: 2,
      orderType: 'all',
      aoeType: 'target',
      magType: 'good',
      chance: [100, 100, 100],
      effect: ['1d4+4', '1d3+5', '1d2+6'],
      profList: ['p'],
    });
  }

  run() {
    const { target } = this.params;
    target.stats.mode('up', 'mgp', this.effectVal());
  }

  // eslint-disable-next-line class-methods-use-this
  customMessage(args: SuccessArgs) {
    const { initiator, target, effect } = args;
    const effectStr = effect?.toString() || '';
    return `${bold(initiator)} увеличивает магическую защиту ${bold(target)} на ${bold(effectStr)}pt`;
  }
}

export default new MagicDefense();
