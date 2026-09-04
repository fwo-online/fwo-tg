import { OrderType } from '@fwo/shared';
import { bold, italic } from '../../utils/formatString';
import { CommonMagic } from '../Constuructors/CommonMagicConstructor';
import type { SuccessArgs } from '../Constuructors/types';

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
      branches: ['protection', 'inquisition'],
      effect: [],
    });
  }

  run() {
    const { target } = this.params;
    target.affects.removeBadEffects();
  }

  customMessage(args: SuccessArgs) {
    const { initiator, target } = args;
    return `${bold(initiator.nick)} снимает все отрицательные эффекты с ${bold(target.nick)}, используя ${italic(this.displayName)}`;
  }
}

export default new Exorcism();
