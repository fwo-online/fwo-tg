const CommonMagic = require('../Constuructors/CommonMagicConstructor');
/**
 * Среднее лечение
 * Основное описание магии общее требовани есть в конструкторе
 */
const mediumHeal = new CommonMagic({
  name: 'mediumHeal',
  desc: 'Среднее лечение цели',
  cost: 6,
  baseExp: 10,
  costType: 'mp',
  lvl: 2,
  orderType: 'all',
  aoeType: 'target',
  magType: 'good',
  chance: [100, 100, 100],
  effect: ['1d4+2', '1d3+3', '1d2+4'],
  profList: ['p'],
});
/**
 * Основная функция запуска магии
 * @param {Object} initiator Обьект кастера
 * @param {Object} target Обьект цели
 */
mediumHeal.run = function mediumHeal(initiator, target) {
  let maxHP = target.stats.val('maxHp'); // показатель максимального HP
  let realHP = target.stats.val('hp'); // показатель текущего HP
  this.status.effect = this.effectVal(); // показатель хила
  if ((+this.status.effect + realHP) > maxHP) {
    this.status.effect = +maxHP - realHP;
  }
  this.status.effect = floatNumber(this.status.effect);
  target.stats.mode('up', 'hp', this.status.effect);
};
mediumHeal.getExp = function getExp(initiator) {
  this.status.exp = Math.round(this.status.effect * 10 * initiator.proc);
  initiator.stats.mode('up', 'exp', this.status.exp);
};
module.exports = mediumHeal;
