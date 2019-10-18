const CommonMagic = require('../Constuructors/CommonMagicConstructor');
/**
 * Благословение
 * Основное описание магии общее требовани есть в конструкторе
 * @todo в старой арене на 3 лвл магии она становилась длительной
 */
const lightHeal = new CommonMagic({
  name: 'lightHeal',
  desc: 'Слабое лечение цели',
  cost: 3,
  baseExp: 10,
  costType: 'mp',
  lvl: 1,
  orderType: 'all',
  aoeType: 'target',
  magType: 'good',
  chance: [100, 100, 100],
  effect: ['1d2', '1d2+1', '1d2+2'],
  profList: ['m', 'p'],
});
/**
 * Основная функция запуска магии
 * @param {Object} initiator Обьект кастера
 * @param {Object} target Обьект цели
 */
lightHeal.run = (initiator, target) => {
  const maxHP = target.stats.val('maxHp'); // показатель максимального HP
  const realHP = target.stats.val('hp'); // показатель текущего HP
  this.status.effect = this.effectVal(); // показатель хила
  if ((+this.status.effect + realHP) > maxHP) {
    this.status.effect = +maxHP - realHP;
  }
  this.status.effect = floatNumber(this.status.effect);
  target.stats.mode('up', 'hp', this.status.effect);
};
lightHeal.getExp = function getExp(initiator) {
  this.status.exp = Math.round(this.status.effect * 10 * initiator.proc);
  initiator.stats.mode('up', 'exp', this.status.exp);
};
module.exports = lightHeal;
