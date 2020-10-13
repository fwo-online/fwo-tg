import { DmgMagic } from '../Constuructors/DmgMagicConstructor';
/**
 * Цепь молний
 * Основное описание магии общее требовани есть в конструкторе
 */
class ChainLightning extends DmgMagic {
  constructor() {
    super({
      name: 'chainLightning',
      displayName: 'Цепь молний',
      desc: 'Цепная молния повреждает выбраную цель молнией и еще одну случайно.',
      cost: 8,
      baseExp: 12,
      costType: 'mp',
      lvl: 3,
      orderType: 'any',
      aoeType: 'targetAoe',
      magType: 'bad',
      chance: [92, 94, 95],
      effect: ['1d3+1', '1d3+2', '1d3+3'],
      dmgType: 'lighting',
      profList: ['m'],
    });
  }

  /**
   * Основная функция запуска магии
   */
  run(): void {
    const { target } = this.params;
    target.stats.mode('down', 'hp', this.effectVal());
  }
}

export default new ChainLightning();
