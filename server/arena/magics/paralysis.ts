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
      chance: ['1d80+20', '1d40+60', '1d20+80'],
      profList: ['p'],
      effect: [],
    });
  }

  run() {
    const { initiator, target } = this.params;
    target.flags.isParalysed.push({ initiator, val: 0 });
  }

  preAffect: Affect['preAffect'] = ({ params: { initiator: target, game } }): undefined => {
    if (target.flags.isParalysed.length) {
      throw new CastError(
        target.flags.isParalysed.map(({ initiator }) =>
          this.getSuccessResult({ initiator, target, game }),
        ),
      );
    }
  };
}

export default new Paralysis();
