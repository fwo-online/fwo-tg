import PhysConstructor from '../Constuructors/PhysConstructor';
/**
 * Физическая атака
 */
class Attack extends PhysConstructor {
  constructor() {
    super({
      name: 'attack',
      displayName: 'Атака',
      desc: 'Атака',
      lvl: 0,
      orderType: 'all',
    });
  }

  /**
 * Кастомный обработчик атаки
 */
  run() {
    if (!this.params) {
      return;
    }

    const { target } = this.params;
    target.stats.down('hp', this.status.hit);
    // getExp вынесен сюда, для возможности "сбросить" атаку, если она была заблокирована protect
    this.getExp();
  }
}
export default new Attack();
