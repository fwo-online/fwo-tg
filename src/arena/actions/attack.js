const PhysConstructor = require('../Constuructors/PhysConstructor');
/**
 * Физическая атака
 */
const attack = new PhysConstructor({
  name: 'attack', desc: 'Атака', lvl: 0, orderType: 'all',
});
/**
 * Кастомный обработчик атаки
 */
attack.run = function run() {
  // пока делаю только 1 руку
  const { target } = this.params;
  target.stats.mode('down', 'hp', this.status.hit);
  this.getExp();
};
// getExp вынесен сюда, для возможности "сбросить" атаку, если она была
// заблокирована action:protect
module.exports = attack;
