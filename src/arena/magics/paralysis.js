const CommonMagic = require('../Constuructors/CommonMagicConstructor');
/**
 * Паралич
 * Основное описание магии общее требовани есть в конструкторе
 */

/**
 * @typedef {import ('../GameService')} game
 * @typedef {import ('../PlayerService')} player
 */

const paralysis = new CommonMagic({
  name: 'paralysis',
  displayName: 'Паралич',
  desc: 'Парализует цель',
  cost: 8,
  baseExp: 80,
  costType: 'mp',
  lvl: 2,
  orderType: 'enemy',
  aoeType: 'target',
  magType: 'bad',
  chance: ['1d80', '1d90', '1d100'],
  profList: ['p'],
});

/**
 * Основная функция запуска магии
 * @param {player} initiator Обьект кастера
 * @param {player} target Обьект цели
 * @param {game} game Обьект игры (не обязателен)
 */
// eslint-disable-next-line no-unused-vars
paralysis.run = function run(initiator, target, game) {
  // тут возможно нужен идентификатор кастера и рауд ?
  // eslint-disable-next-line no-param-reassign
  target.flags.isParalysed = true;
};
module.exports = paralysis;
