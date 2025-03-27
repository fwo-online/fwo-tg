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
      effect: ['1d2+1', '1d2+2', '1d2+3'],
      dmgType: 'clear',
      profList: ['m'],
    });
  }

  /**
   * Основная функция запуска магии
   */
  run(): void {
    const { target, initiator } = this.params;
    const effect = this.effectVal();

    target.stats.down('hp', effect);
    initiator.stats.up('hp', effect + Math.min(0, target.stats.val('hp'))); // хилим только на урон до 0 хп
  }
}

export default new Vampirism();
