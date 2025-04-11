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
      orderType: 'team',
      aoeType: 'target',
      magType: 'good',
      chance: ['1d60', '1d70', '1d80'],
      profList: ['p'],
      effect: [],
    });
  }

  run() {
    const { game, target } = this.params;
    const entries = Object.entries(game.longActions);

    entries.forEach(([key, items]) => {
      const magic = arena.magics[key];
      if (magic.magType === 'bad') {
        game.longActions[key] = items.filter((item) => item.target !== target.id);
      }
    });
  }

  customMessage(args: SuccessArgs) {
    const { initiator, target } = args;
    return `${bold(initiator.nick)} снимает все отрицательные эффекты с ${bold(target.nick)}, используя ${italic(this.displayName)}`;
  }
}

export default new Exorcism();
