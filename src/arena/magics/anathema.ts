import arena from '@/arena';
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
      orderType: 'enemy',
      aoeType: 'target',
      magType: 'bad',
      chance: ['1d60', '1d70', '1d85'],
      profList: ['p'],
      effect: [],
    });
  }

  run() {
    const { game, target } = this.params;
    const entries = Object.entries(game.longActions);

    entries.forEach(([key, items]) => {
      const magic = arena.magics[key];
      if (magic.magType === 'good') {
        game.longActions[key] = items.filter((item) => item.target !== target.id);
      }
    });
  }

  customMessage(args: SuccessArgs) {
    const { initiator, target } = args;
    return `${bold(initiator)} снимает все положительные эффекты с ${bold(target)}, используя ${italic(this.displayName)}`;
  }
}

export default new Anathema();
