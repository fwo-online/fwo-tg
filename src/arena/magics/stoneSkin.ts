import { CommonMagic } from '../Constuructors/CommonMagicConstructor';

/**
 * Каменная кожа
 * Основное описание магии общее требовани есть в конструкторе
 */

class StoneSkin extends CommonMagic {
  constructor() {
    super({
      name: 'stoneSkin',
      displayName: 'Каменная кожа',
      desc: 'Превращает кожу цели в камень',
      cost: 3,
      baseExp: 6,
      costType: 'mp',
      lvl: 1,
      orderType: 'all',
      aoeType: 'target',
      magType: 'good',
      chance: [100, 100, 100],
      effect: ['1d4+2', '1d3+3', '1d2+4'],
      profList: ['p'],
    });
  }

  run() {
    const { target } = this.params;
    target.stats.mode('up', 'pdef', this.effectVal());
  }
}

export default new StoneSkin();