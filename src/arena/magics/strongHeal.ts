import { bold, italic } from '../../utils/formatString';
import type { SuccessArgs } from '../Constuructors/types';
import { HealMagic } from './heal';

class StrongHeal extends HealMagic {
  constructor() {
    super({
      name: 'strongHeal',
      displayName: 'Сильное лечение',
      desc: 'Сильное лечение цели',
      cost: 12,
      baseExp: 10,
      costType: 'mp',
      lvl: 3,
      orderType: 'all',
      aoeType: 'target',
      magType: 'good',
      chance: [100, 100, 100],
      effect: ['1d6+4', '1d5+5', '1d4+6'],
      profList: ['p'],
    });
  }

  customMessage(args: SuccessArgs) {
    const { initiator, target, effect } = args;
    return `${bold(initiator)} применил ${italic(this.displayName)} на ${bold(target)} излечив его на ${bold(effect.toString())}`;
  }
}
export default new StrongHeal();
