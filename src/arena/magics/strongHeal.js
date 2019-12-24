// @todo сильное лечение так же должно исцелять от чумы
const CommonMagic = require('../Constuructors/CommonMagicConstructor');
const floatNumber = require('../floatNumber');
/**
 * Сильное лечение
 * Основное описание магии общее требовани есть в конструкторе
 */

/** @typedef {import ('../PlayerService')} player */

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
 * @param {player} target Обьект цели
 */
strongHeal.run = function run(target) {
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
strongHeal.getExp = function getExp (initiator) {
  this.status.exp = Math.round(this.status.effect * 10 * initiator.proc);
  initiator.stats.mode('up', 'exp', this.status.exp);
};
module.exports = strongHeal;
