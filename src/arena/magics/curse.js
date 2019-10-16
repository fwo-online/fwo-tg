const CommonMagic = require('../Constuructors/LongMagicConstructor');
/**
 * Проклятие
 * Основное описание магии общее требовани есть в конструкторе
 */
const curse = new CommonMagic({
  name: 'curse',
  desc: 'Понижает вероятность атаки у цели и понижает ее защиту',
  cost: 3,
  baseExp: 8,
  costType: 'mp',
  lvl: 1,
  orderType: 'all',
  aoeType: 'target',
  magType: 'bad', // wtf ? разве оно good?
  chance: [100, 100, 100],
  effect: ['1d4+2', '1d3+3', '1d2+4'],
  profList: ['p'],
});
/**
 * Основная функция запуска магии
 * @param {Object} initiator Обьект кастера
 * @param {Object} target Обьект цели
 */
curse.longRun = function curse(initiator, target) {
  target.stats.mode('down', 'patk', this.effectVal(initiator));
  target.stats.mode('down', 'pdef', this.effectVal(initiator));
};
module.exports = curse;
