const DmgMagic = require('../Constuructors/DmgMagicConstructor');
/**
 * Магическая стрела
 * Основное описание магии общее требовани есть в конструкторе
 */

/** @typedef {import ('../PlayerService')} player */

const magicArrow = new DmgMagic({
  name: 'magicArrow',
  displayName: 'Магическая стрела',
  desc: 'Магическая стрела',
  cost: 3,
  baseExp: 8,
  costType: 'mp',
  lvl: 1,
  orderType: 'enemy',
  aoeType: 'target',
  magType: 'bad',
  chance: [92, 94, 95],
  effect: ['1d2', '1d2+1', '1d2+2'],
  dmgType: 'clear',
  profList: ['m'],
});
/**
 * Основная функция запуска магии
 * @param {player} initiator Обьект кастера
 * @param {player} target Обьект цели
 */
magicArrow.run = function run(initiator, target) {
  target.stats.mode('down', 'hp', this.effectVal(initiator));
};
module.exports = magicArrow;
