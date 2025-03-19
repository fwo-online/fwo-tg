import { bold, italic } from '../../utils/formatString';
import type { SuccessArgs } from '../Constuructors/types';
import { HealMagic } from './heal';

class MediumHeal extends HealMagic {
  constructor() {
    super({
      name: 'mediumHeal',
      displayName: 'Среднее лечение',
      desc: 'Среднее лечение цели',
      cost: 6,
      baseExp: 10,
      costType: 'mp',
      lvl: 2,
      orderType: 'all',
      aoeType: 'target',
      magType: 'good',
      chance: [100, 100, 100],
      effect: ['1d4+2', '1d3+3', '1d2+4'],
      profList: ['p'],
    });
  }

  customMessage(args: SuccessArgs) {
    const { initiator, target, effect } = args;
    return `${bold(initiator.nick)} применил ${italic(this.displayName)} на ${bold(target.nick)} излечив его на ${bold(`${effect}`)}`;
  }
}
export default new MediumHeal();
