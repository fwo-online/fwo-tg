const DmgMagic = require('../Constuructors/DmgMagicConstructor');
/**
 * Кислотный плевок
 * Основное описание магии общее требовани есть в конструкторе
 */
const acidSpittle = new DmgMagic({
  name: 'acidSpittle',
  desc: 'Кислотный плевок',
  cost: 10,
  baseExp: 12,
  costType: 'mp',
  lvl: 1,
  orderType: 'enemy',
  aoeType: 'target',
  magType: 'bad',
  chance: [92, 94, 95],
  effect: ['1d3+3', '1d3+4', '1d3+5'],
  dmgType: 'acid',
  profList: ['m'],
});
/**
 * Основная функция запуска магии
 * @param {Object} initiator Обьект кастера
 * @param {Object} target Обьект цели
 */
acidSpittle.run = (initiator, target) => {
  target.stats.mode('down', 'hp', this.effectVal(initiator));
};
module.exports = acidSpittle;
