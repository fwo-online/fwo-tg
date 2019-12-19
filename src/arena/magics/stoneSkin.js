const CommonMagic = require('../Constuructors/CommonMagicConstructor');
/**
 * Каменная кожа
 * Основное описание магии общее требовани есть в конструкторе
 */

/** @typedef {import ('../PlayerService')} player */

const stoneSkin = new CommonMagic({
  name: 'stoneSkin',
  desc: 'Превращает кожу цели в камень',
  cost: 3,
  baseExp: 6,
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
 * @param {player} initiator Обьект кастера
 * @param {player} target Обьект цели
 */
stoneSkin.run = function run(initiator, target) {
  target.stats.mode('up', 'pdef', this.effectVal(initiator));
};
module.exports = stoneSkin;
