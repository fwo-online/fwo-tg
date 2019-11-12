const CommonMagic = require('../Constuructors/CommonMagicConstructor');
const floatNumber = require('../floatNumber');
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
  lightHeal.status.effect = lightHeal.effectVal(); // показатель хила
  if ((+lightHeal.status.effect + realHP) > maxHP) {
    lightHeal.status.effect = +maxHP - realHP;
  }
  lightHeal.status.effect = floatNumber(lightHeal.status.effect);
  target.stats.mode('up', 'hp', lightHeal.status.effect);
};
lightHeal.getExp = function getExp(initiator) {
  lightHeal.status.exp = Math.round(lightHeal.status.effect * 10 * initiator.proc);
  initiator.stats.mode('up', 'exp', lightHeal.status.exp);
};
module.exports = lightHeal;
