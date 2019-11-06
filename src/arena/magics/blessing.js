const CommonMagic = require('../Constuructors/CommonMagicConstructor');
/**
 * Благословение
 * Основное описание магии общее требовани есть в конструкторе
 * @todo в старой арене на 3 лвл магии она становилась длительной
 */
const blessing = new CommonMagic({
  name: 'blessing',
  desc: 'Благословляет цель увеличивая её параметры',
  cost: 3,
  baseExp: 8,
  costType: 'mp',
  lvl: 1,
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
blessing.run = (initiator, target) => {
  target.stats.mode('up', 'patk', this.effectVal(initiator));
  target.stats.mode('up', 'pdef', this.effectVal(initiator));
};
module.exports = blessing;
