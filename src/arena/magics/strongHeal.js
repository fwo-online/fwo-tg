// @todo сильное лечение так же должно исцелять от чумы
const CommonMagic = require('../Constuructors/CommonMagicConstructor');
/**
 * Сильное лечение
 * Основное описание магии общее требовани есть в конструкторе
 */
const strongHeal = new CommonMagic({
  name: 'strongHeal',
  desc: 'Сильное лечение цели',
  cost: 12,
  baseExp: 10,
  costType: 'mp',
  lvl: 3,
  orderType: 'all',
  aoeType: 'target',
  magType: 'good',
  chance: [100, 100, 100],
  effect: ['1d6+4', '1d5+5', '1d4+6'],
  profList: ['p'],
});
/**
 * Основная функция запуска магии
 * @param {Object} initiator Обьект кастера
 * @param {Object} target Обьект цели
 */
strongHeal.run = function mediumHeal(initiator, target) {
  let maxHP = target.stats.val('maxHp'); // показатель максимального HP
  let realHP = target.stats.val('hp'); // показатель текущего HP
  this.status.effect = this.effectVal(); // показатель хила
  if ((+this.status.effect + realHP) > maxHP) {
    this.status.effect = +maxHP - realHP;
  }
  this.status.effect = floatNumber(this.status.effect);
  target.stats.mode('up', 'hp', this.status.effect);
};
strongHeal.getExp = function getExp(initiator) {
  this.status.exp = Math.round(this.status.effect * 10 * initiator.proc);
  initiator.stats.mode('up', 'exp', this.status.exp);
};
module.exports = strongHeal;
