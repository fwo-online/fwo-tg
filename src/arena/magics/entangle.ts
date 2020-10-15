import { CommonMagic } from '../Constuructors/CommonMagicConstructor';

/**
 * Опутывание
 * Основное описание магии общее требовани есть в конструкторе
 */
class Entangle extends CommonMagic {
  constructor() {
    super({
      name: 'entangle',
      displayName: 'Опутывание',
      desc: 'Уменьшает защиту цели.',
      cost: 3,
      baseExp: 6,
      costType: 'mp',
      lvl: 1,
      orderType: 'enemy',
      aoeType: 'target',
      magType: 'bad',
      chance: [100, 100, 100],
      effect: ['1d2+4', '1d2+5', '1d2+6'],
      profList: ['p'],
    });
  }

  run() {
    const { target } = this.params;
    target.stats.mode('down', 'pdef', this.effectVal());
  }
}

export default new Entangle();
