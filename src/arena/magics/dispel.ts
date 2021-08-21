import { bold } from '../../utils/formatString';
import type { SuccessArgs } from '../BattleLog';
import { CommonMagic } from '../Constuructors/CommonMagicConstructor';
import type { LongItem } from '../Constuructors/LongMagicConstructor';
import _ from 'lodash';

/**
 * Снятие магии
 * Основное описание магии общее требовани есть в конструкторе
 */
class Dispel extends CommonMagic {
  dispelled!: Record<string, LongItem[]> // закладка для customMessage

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
    const { target, game } = this.params;
    const entries = Object.entries(game.longActions);
    entries.forEach(([name, items]) => {
      const [dispelled, rest] = _.partition(items, (item) => item.target === target.id);
      this.dispelled[name] = dispelled;
      game.longActions[name] = rest;
    });
  }

  next() {
    super.next();
    this.dispelled = {};
  }

  customMessage(args: SuccessArgs) {
    const { initiator, target } = args;
    return `${bold(initiator)} снимает все длительные магии с ${target}, используя заклинание ${this.displayName}`;
  }
}

export default new Dispel();
