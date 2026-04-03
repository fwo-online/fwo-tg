import { OrderType } from '@fwo/shared';
import arena from '@/arena';
import { Magic } from '@/arena/Constuructors/MagicConstructor';
import { bold, italic } from '../../utils/formatString';
import { CommonMagic } from '../Constuructors/CommonMagicConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * Экзорцизм
 * Основное описание магии общее требовани есть в конструкторе
 */
class Anathema extends CommonMagic {
  constructor() {
    super({
      name: 'anathema',
      displayName: 'Анафема',
      desc: 'Снимает все длительные положительные заклинания с цели не задевая при этом отрицательные',
      cost: 20,
      baseExp: 80,
      costType: 'mp',
      lvl: 4,
      orderType: OrderType.Enemy,
      aoeType: 'target',
      magType: 'bad',
      chance: ['1d60+30', '1d30+55', '1d10+75'],
      profList: ['p'],
      effect: [],
    });
  }

  run() {
    const { target } = this.params;
    target.affects.filterAffects((affect) => {
      const action = arena.actions[affect.action];
      if (action instanceof Magic) {
        return action.magType !== 'good' || affect.type !== 'long-effect';
      }

      return true;
    });
  }

  customMessage(args: SuccessArgs) {
    const { initiator, target } = args;
    return `${bold(initiator.nick)} снимает все положительные эффекты с ${bold(target.nick)}, используя ${italic(this.displayName)}`;
  }
}

export default new Anathema();
