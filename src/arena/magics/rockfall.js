const DmgMagic = require('../Constuructors/DmgMagicConstructor');
/**
 * Камнепад
 * Основное описание магии общее требовани есть в конструкторе
 */
const rockfall = new DmgMagic({
  name: 'rockfall',
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
/**
 * Основная функция запуска магии
 * @param {Object} initiator Обьект кастера
 * @param {Object} target Обьект цели
 */
rockfall.run = function rockfall(initiator, target) {
  target.stats.mode('down', 'hp', this.effectVal(initiator));
};
module.exports = rockfall;
