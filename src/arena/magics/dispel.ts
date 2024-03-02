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
      orderType: 'all',
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
      game.longActions[key] = items.filter((item) => item.target !== target.id);
    });
  }

  customMessage(args: SuccessArgs) {
    const { initiator, target } = args;
    return `${bold(initiator)} снимает все длительные магии с ${bold(target)}, используя заклинание ${italic(this.displayName)}`;
  }
}

export default new Dispel();
