import { OrderType } from '@fwo/shared';
import { Magic } from '@/arena/Constuructors/MagicConstructor';
import { bold, italic } from '../../utils/formatString';
import { CommonMagic } from '../Constuructors/CommonMagicConstructor';
import type { SuccessArgs } from '../Constuructors/types';
import arena from '../index';

/**
 * Экзорцизм
 * Основное описание магии общее требовани есть в конструкторе
 */
class Exorcism extends CommonMagic {
  constructor() {
    super({
      name: 'exorcism',
      displayName: 'Экзорцизм',
      desc: 'Экзорцизм снимает все отрицательные эффекты с цели',
      cost: 20,
      baseExp: 80,
      costType: 'mp',
      lvl: 3,
      orderType: OrderType.Team,
      aoeType: 'target',
      magType: 'good',
      chance: ['1d60+30', '1d30+55', '1d10+70'],
      profList: ['p'],
      effect: [],
    });
  }

  run() {
    const { target } = this.params;
    target.affects.filterAffects((affect) => {
      const action = arena.actions[affect.action];
      if (action instanceof Magic) {
        return action.magType !== 'bad' || affect.type !== 'long-effect';
      }

      return true;
    });
  }

  customMessage(args: SuccessArgs) {
    const { initiator, target } = args;
    return `${bold(initiator.nick)} снимает все отрицательные эффекты с ${bold(target.nick)}, используя ${italic(this.displayName)}`;
  }
}

export default new Exorcism();
