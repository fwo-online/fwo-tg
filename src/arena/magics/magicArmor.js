const CommonMagic = require('../Constuructors/CommonMagicConstructor');
/**
 * Магический доспех
 * Основное описание магии общее требовани есть в конструкторе
 */
const magicArmor = new CommonMagic({
  name: 'magicArmor',
  desc: 'Создает магический доспех на маге',
  cost: 3,
  baseExp: 6,
  costType: 'mp',
  lvl: 1,
  orderType: 'all',
  aoeType: 'target',
  magType: 'good',
  chance: [100, 100, 100],
  effect: ['1d2+3', '1d2+4', '1d2+5'],
  profList: ['m'],
});
/**
 * Основная функция запуска магии
 * @param {Object} initiator Обьект кастера
 * @param {Object} target Обьект цели
 */
magicArmor.run = (initiator, target) => {
  target.stats.mode('up', 'pdef', this.effectVal(initiator));
};
module.exports = magicArmor;