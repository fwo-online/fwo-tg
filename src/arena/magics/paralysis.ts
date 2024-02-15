import { CommonMagic } from '../Constuructors/CommonMagicConstructor';
import { PreAffect } from '../Constuructors/interfaces/PreAffect';
import CastError from '../errors/CastError';

/**
 * Паралич
 * Основное описание магии общее требовани есть в конструкторе
 */
class Paralysis extends CommonMagic implements PreAffect {
  constructor() {
    super({
      name: 'paralysis',
      displayName: 'Паралич',
      desc: 'Парализует цель',
      cost: 8,
      baseExp: 80,
      costType: 'mp',
      lvl: 2,
      orderType: 'enemy',
      aoeType: 'target',
      magType: 'bad',
      chance: ['1d80', '1d90', '1d100'],
      profList: ['p'],
      effect: [],
    });
  }

  run() {
    const { target } = this.params;
    target.flags.isParalysed = true;
  }

  preAffect({ initiator, target, game } = this.params) {
    if (target.flags.isParalysed) {
      throw new CastError(this.getSuccessResult({ initiator: target, target: initiator, game }));
    }
  }
}

export default new Paralysis();
