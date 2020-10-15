import { DmgMagic } from '../Constuructors/DmgMagicConstructor';

/**
 * Вампиризм
 * Основное описание магии общее требовани есть в конструкторе
 */
class Vampirism extends DmgMagic {
  constructor() {
    super({
      name: 'vampirism',
      displayName: 'Вампиризм',
      desc: 'Возвращает часть нанесеного урона в качесте жизней',
      cost: 12,
      baseExp: 10,
      costType: 'mp',
      lvl: 3,
      orderType: 'enemy',
      aoeType: 'target',
      magType: 'bad',
      chance: [92, 94, 95],
      effect: ['1d6+4', '1d5+5', '1d4+6'],
      dmgType: 'clear',
      profList: ['m'],
    });
  }

  /**
   * Основная функция запуска магии
   */
  run(): void {
    const { target, initiator } = this.params;
    target.stats.mode('down', 'hp', this.effectVal());
    initiator.stats.mode('up', 'hp', this.status.hit);
  }
}

export default new Vampirism();
