import { CommonMagic } from '../Constuructors/CommonMagicConstructor';
import type { Affect } from '../Constuructors/interfaces/Affect';
import CastError from '../errors/CastError';

/**
 * Безмолвие
 * Основное описание магии общее требовани есть в конструкторе
 */
class Silence extends CommonMagic implements Affect {
  constructor() {
    super({
      name: 'silence',
      displayName: 'Безмолвие',
      desc: '',
      cost: 16,
      baseExp: 80,
      costType: 'mp',
      lvl: 4,
      orderType: 'all',
      aoeType: 'target',
      magType: 'bad',
      chance: ['1d60', '1d70', '1d85'],
      profList: ['m'],
      effect: [],
    });
  }

  run() {
    const { initiator, target } = this.params;
    target.flags.isSilenced.push({ initiator, val: 0 });
  }

  preAffect: Affect['preAffect'] = ({ params: { initiator: target, game } }): undefined => {
    if (target.flags.isSilenced.length) {
      throw new CastError(
        target.flags.isBehindWall.map(({ initiator }) =>
          this.getSuccessResult({ initiator, target: initiator, game }),
        ),
      );
    }
  };
}

export default new Silence();
