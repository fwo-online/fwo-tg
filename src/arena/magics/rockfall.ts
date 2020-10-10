import { DmgMagic } from '../Constuructors/DmgMagicConstructor';

/**
 * Камнепад
 * Основное описание магии общее требовани есть в конструкторе
 */
class AcidSpittle extends DmgMagic {
  constructor() {
    super({
      name: 'rockfall',
      displayName: 'Камнепад',
      desc: 'Наносит повреждение цели.',
      cost: 3,
      baseExp: 16,
      costType: 'mp',
      lvl: 1,
      orderType: 'enemy',
      aoeType: 'target',
      magType: 'bad',
      chance: [92, 94, 95],
      effect: ['1d2', '1d2+1', '1d2+2'],
      dmgType: 'physical',
      profList: ['p'],
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

export default new AcidSpittle();
