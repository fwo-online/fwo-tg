import { Magics } from '@/data';
import { bold, italic } from '../../utils/formatString';
import type { SuccessArgs } from '../Constuructors/types';
import { HealMagic } from './heal';

class LightHeal extends HealMagic {

  customMessage(args: SuccessArgs) {
    const { initiator, target, effect } = args;
    return `${bold(initiator.nick)} применил ${italic(this.displayName)} на ${bold(target.nick)} излечив его на ${bold(`${effect}`)}`;
  }
}

export default new LightHeal(Magics.baseParams.lightHeal);
