import { bold, italic } from '../../utils/formatString';
import type { SuccessArgs } from '../BattleLog';
import { CommonMagic } from '../Constuructors/CommonMagicConstructor';
import * as magics from './index';

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
      orderType: 'enemy',
      aoeType: 'target',
      magType: 'good',
      chance: ['1d60', '1d70', '1d80'],
      profList: ['m'],
      effect: [],
    });
  }

  run() {
    // Очищаем все "bad" магии в которых target является target данной магии
    const { game, target } = this.params;
    const { ordersList } = game.orders;
    game.orders.ordersList = ordersList.filter((order) => {
      if (order.target === target.id) {
        return magics[order.action]?.magType !== 'bad';
      }
      return true;
    });
  }

  customMessage(args: SuccessArgs) {
    const { initiator, target } = args;
    return `${bold(initiator)} снимает все отрицательные эффекты с ${bold(target)}, используя ${italic(this.displayName)}`;
  }
}

export default new Exorcism();
