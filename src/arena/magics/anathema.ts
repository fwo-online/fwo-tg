import { bold, italic } from '../../utils/formatString';
import type { SuccessArgs } from '../BattleLog';
import { CommonMagic } from '../Constuructors/CommonMagicConstructor';
import type { LongItem } from '../Constuructors/LongMagicConstructor';
import arena from '../index';

type LongActionsEntry = [magic: keyof typeof arena.magics, item?: LongItem[]]
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
      magType: 'good',
      chance: ['1d60', '1d70', '1d85'],
      profList: ['m'],
      effect: [],
    });
  }

  run() {
    // Очищаем все "bad" магии в которых target является target данной магии
    const { game, target } = this.params;
    const { longActions } = game;
    const entries = Object.entries(longActions) as LongActionsEntry[];
    entries.reduce((sum, [key, items]) => {
      if (!items) return sum;
      const magic = arena.magics[key];
      if (magic.magType === 'good') {
        const newItem = items.filter((item) => item.target !== target.id);
        sum[key] = newItem;
      }
      return sum;
    }, {} as typeof longActions);
  }

  customMessage(args: SuccessArgs) {
    const { initiator, target } = args;
    return `${bold(initiator)} снимает все положительные эффекты с ${bold(target)}, используя ${italic(this.displayName)}`;
  }
}

export default new Anathema();
