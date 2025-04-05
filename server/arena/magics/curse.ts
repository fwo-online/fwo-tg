import { LongMagic } from '../Constuructors/LongMagicConstructor';

/**
 * Проклятие
 * Основное описание магии общее требовани есть в конструкторе
 */
class Curse extends LongMagic {
  constructor() {
    super({
      name: 'curse',
      displayName: 'Проклятие',
      desc: 'Понижает атаку и защиту цели',
      cost: 3,
      baseExp: 8,
      costType: 'mp',
      lvl: 1,
      orderType: 'all',
      aoeType: 'target',
      magType: 'bad',
      chance: [100, 100, 100],
      effect: ['1d4+2', '1d3+3', '1d2+4'],
      profList: ['p'],
    });
  }

  run() {
    const { target } = this.params;
    target.stats.mode('down', 'phys.attack', this.effectVal());
    target.stats.mode('down', 'phys.defence', this.effectVal());
  }

  runLong() {
    const { target } = this.params;
    target.stats.mode('down', 'phys.attack', this.effectVal());
    target.stats.mode('down', 'phys.defence', this.effectVal());
  }
}

export default new Curse();
