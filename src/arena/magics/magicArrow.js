const DmgMagic = require('../Constuructors/DmgMagicConstructor');
/**
 * Магическая стрела
 * Основное описание магии общее требовани есть в конструкторе
 */
const magicArrow = new DmgMagic({
  name: 'magicArrow',
  desc: 'Магическая стрела',
  cost: 3,
  baseExp: 8,
  costType: 'mp',
  lvl: 1,
  orderType: 'enemy',
  aoeType: 'target',
  magType: 'bad',
  chance: [92, 94, 95],
  effect: ['1d2', '1d2+1', '1d2+2'],
  dmgType: 'clear',
  profList: ['m'],
});
/**
 * Основная функция запуска магии
 * @param {Object} initiator Обьект кастера
 * @param {Object} target Обьект цели
 */
magicArrow.run = (initiator, target) => {
  target.stats.mode('down', 'hp', this.effectVal(initiator));
};
module.exports = magicArrow;
