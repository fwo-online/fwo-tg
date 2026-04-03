import { OrderType } from '@fwo/shared';
import arena from '@/arena';
import { Magic } from '@/arena/Constuructors/MagicConstructor';
import { bold, italic } from '../../utils/formatString';
import { CommonMagic } from '../Constuructors/CommonMagicConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * Снятие магии
 * Основное описание магии общее требовани есть в конструкторе
 */
class Dispel extends CommonMagic {
  constructor() {
    super({
      name: 'dispel',
      displayName: 'Рассеивание',
      desc: 'Снимает все длительные магии с цели',
      cost: 18,
      baseExp: 80,
      costType: 'mp',
      lvl: 2,
      orderType: OrderType.All,
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
        return affect.type !== 'long-effect';
      }

      return true;
    });
  }

  customMessage(args: SuccessArgs) {
    const { initiator, target } = args;
    return `${bold(initiator.nick)} снимает все длительные магии с ${bold(target.nick)}, используя заклинание ${italic(this.displayName)}`;
  }
}

export default new Dispel();
