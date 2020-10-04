const DmgMagic = require('../Constuructors/DmgMagicConstructor');
/**
 * Кислотный плевок
 * Основное описание магии общее требовани есть в конструкторе
 */

/** @typedef {import ('../PlayerService').default} player */

const acidSpittle = new DmgMagic({
  name: 'acidSpittle',
  displayName: 'Кислотный плевок',
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
 * @param {player} initiator Обьект кастера
 * @param {player} target Обьект цели
 */
acidSpittle.run = function run(initiator, target) {
  target.stats.mode('down', 'hp', this.effectVal());
};
module.exports = acidSpittle;
