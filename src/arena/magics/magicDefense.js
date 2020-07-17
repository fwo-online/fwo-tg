// import CommonMagic from './CommonMagic';
const CommonMagic = require('../Constuructors/CommonMagicConstructor');
/**
 * Магическая защита
 * Основное описание магии общее требовани есть в конструкторе
 */

/**
 * @typedef {import ('../GameService')} game
 * @typedef {import ('../PlayerService')} player
 */

const magicDefense = new CommonMagic({
  name: 'magicDefense',
  displayName: 'Магическая защита',
  desc: '',
  cost: 12,
  baseExp: 40,
  costType: 'mp',
  lvl: 2,
  orderType: 'all',
  aoeType: 'target',
  magType: 'good',
  chance: [100, 100, 100],
  effect: ['1d4+4', '1d3+5', '1d2+6'],
  profList: ['p'],
});
/**
 * Основная функция запуска магии
 * @param {player} initiator Обьект кастера
 * @param {player} target Обьект цели
 */
magicDefense.run = function run(initiator, target) {
  this.status.effect = this.effectVal(initiator);
  target.stats.mode('up', 'mgp', this.status.effect);
};
module.exports = magicDefense;
