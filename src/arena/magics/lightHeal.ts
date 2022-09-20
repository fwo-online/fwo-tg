import { bold, italic } from '../../utils/formatString';
import type { HealNext } from '../Constuructors/HealMagicConstructor';
import { HealMagic } from './heal';

class LightHeal extends HealMagic {
  constructor() {
    super({
      name: 'lightHeal',
      displayName: 'Слабое лечение',
      desc: 'Слабое лечение цели',
      cost: 3,
      baseExp: 10,
      costType: 'mp',
      lvl: 1,
      orderType: 'all',
      aoeType: 'target',
      magType: 'good',
      chance: [100, 100, 100],
      effect: ['1d2', '1d2+1', '1d2+2'],
      profList: ['m', 'p'],
    });
  }

  customMessage(args: HealNext) {
    const { initiator, target, effect } = args;
    return `${bold(initiator)} применил ${italic(this.displayName)} на ${bold(target)} излечив его на ${bold(`${effect}`)}`;
  }
}

export default new LightHeal();
