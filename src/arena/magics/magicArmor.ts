import { bold } from '../../utils/formatString';
import { CommonMagic } from '../Constuructors/CommonMagicConstructor';
import type { SuccessArgs } from '../Constuructors/types';
/**
 * Магический доспех
 * Основное описание магии общее требовани есть в конструкторе
 */
class MagicArmor extends CommonMagic {
  constructor() {
    super({
      name: 'magicArmor',
      displayName: 'Магический доспех',
      desc: 'Создает магический доспех на маге',
      cost: 3,
      baseExp: 6,
      costType: 'mp',
      lvl: 1,
      orderType: 'all',
      aoeType: 'target',
      magType: 'good',
      chance: [100, 100, 100],
      effect: ['1d2+3', '1d2+4', '1d2+5'],
      profList: ['m'],
    });
  }

  run() {
    const { target } = this.params;
    target.stats.mode('up', 'phys.defence', this.effectVal());
  }

  // eslint-disable-next-line class-methods-use-this
  customMessage(args: SuccessArgs) {
    const { initiator, target, effect } = args;
    const effectStr = effect?.toString() || '';
    return `${bold(initiator.nick)} поднимает защиту ${bold(target.nick)} на ${bold(effectStr)}pt`;
  }
}

export default new MagicArmor();
