import { CommonMagic } from '../Constuructors/CommonMagicConstructor';

/**
 * Магический доспех
 * Основное описание магии общее требовани есть в конструкторе
 */
class MagicArmor extends CommonMagic {
  constructor() {
    super({
      name: 'magicArmor',
      displayName: 'Магический доспех',
      desc: 'Создает магический доспех на маге',
      cost: 3,
      baseExp: 6,
      costType: 'mp',
      lvl: 1,
      orderType: 'all',
      aoeType: 'target',
      magType: 'good',
      chance: [100, 100, 100],
      effect: ['1d2+3', '1d2+4', '1d2+5'],
      profList: ['m'],
    });
  }

  run() {
    const { target } = this.params;
    target.stats.mode('up', 'pdef', this.effectVal());
  }
}

export default new MagicArmor();
