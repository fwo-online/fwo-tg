import { CommonMagic } from '../Constuructors/CommonMagicConstructor';

/**
 * Безумие
 * Основное описание магии общее требовани есть в конструкторе
 */
class Madness extends CommonMagic {
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
      chance: ['1d75', '1d80', '1d82'],
      profList: ['m'],
      effect: [],
    });
  }

  run() {
    const { target } = this.params;
    target.flags.isMad = true;
  }
}

export default new Madness();
