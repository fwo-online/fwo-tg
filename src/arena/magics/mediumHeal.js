const CommonMagic = require('../Constuructors/CommonMagicConstructor');
const floatNumber = require('../floatNumber');
/**
 * Среднее лечение
 * Основное описание магии общее требовани есть в конструкторе
 */

/** @typedef {import ('../PlayerService')} player */

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
 * @param {player} initiator Обьект кастера
 * @param {player} target Обьект цели
 */
mediumHeal.run = function run(initiator, target) {
  const maxHP = target.stats.val('maxHp'); // показатель максимального HP
  const realHP = target.stats.val('hp'); // показатель текущего HP
  this.status.effect = this.effectVal(); // показатель хила
  if ((+this.status.effect + realHP) > maxHP) {
    this.status.effect = +maxHP - realHP;
  }
  this.status.effect = floatNumber(this.status.effect);
  target.stats.mode('up', 'hp', this.status.effect);
};
/**
 * @param {player} initiator
 */
mediumHeal.getExp = function getExp(initiator) {
  this.status.exp = Math.round(this.status.effect * 10 * initiator.proc);
  initiator.stats.mode('up', 'exp', this.status.exp);
};
module.exports = mediumHeal;
