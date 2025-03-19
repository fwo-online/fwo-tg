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
    target.flags.isSilenced.push({
      initiator: initiator.nick,
      val: 0,
    });
  }

  preAffect: Affect['preAffect'] = ({ params: { initiator, target, game } }): undefined => {
    const { isSilenced } = initiator.flags;
    if (isSilenced.some((e) => e.initiator !== this.name)) {
      // если кастер находится под безмолвием/бунтом богов
      throw new CastError(this.getSuccessResult({ initiator: target, target: initiator, game }));
    }
  };
}

export default new Silence();
