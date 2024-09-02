import { CommonMagic } from '../Constuructors/CommonMagicConstructor';
import type { Affect } from '../Constuructors/interfaces/Affect';
import CastError from '../errors/CastError';

/**
 * Паралич
 * Основное описание магии общее требовани есть в конструкторе
 */
class Paralysis extends CommonMagic implements Affect {
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

  preAffect: Affect['preAffect'] = ({ params: { initiator, target, game } }) => {
    if (target.flags.isParalysed) {
      throw new CastError(this.getSuccessResult({ initiator: target, target: initiator, game }));
    }
  };
}

export default new Paralysis();
