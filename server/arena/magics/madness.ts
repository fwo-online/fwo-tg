import { CommonMagic } from '../Constuructors/CommonMagicConstructor';
import type { Affect } from '../Constuructors/interfaces/Affect';

/**
 * Безумие
 * Основное описание магии общее требовани есть в конструкторе
 */
class Madness extends CommonMagic implements Affect {
  constructor() {
    super({
      name: 'madness',
      displayName: 'Безумие',
      desc: 'Заставляет цель атаковать саму себя',
      cost: 10,
      baseExp: 80,
      costType: 'mp',
      lvl: 2,
      orderType: 'enemy',
      aoeType: 'target',
      magType: 'bad',
      chance: ['1d10+75', '1d20+80', '1d20+85'],
      profList: ['m'],
      effect: [],
    });
  }

  run() {
    const { initiator, target } = this.params;
    target.flags.isMad.push({ initiator, val: 0 });
  }

  preAffect: Affect['preAffect'] = ({ params }) => {
    if (params.initiator.flags.isMad.length) {
      params.target = params.initiator;

      return params.initiator.flags.isMad.map(({ initiator }) =>
        this.getSuccessResult({
          ...params,
          initiator,
        }),
      );
    }
  };
}

export default new Madness();
