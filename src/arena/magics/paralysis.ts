import { CommonMagic } from '../Constuructors/CommonMagicConstructor';

/**
 * Паралич
 * Основное описание магии общее требовани есть в конструкторе
 */
class Paralysis extends CommonMagic {
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
}

export default new Paralysis();
