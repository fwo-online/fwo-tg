const CommonMagic = require('../Constuructors/CommonMagicConstructor');
/**
 * Паралич
 * Основное описание магии общее требовани есть в конструкторе
 */

/**
 * @typedef {import ('../GameService')} game
 * @typedef {import ('../PlayerService').default} player
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
paralysis.run = function run(_initiator, target, _game) {
  // тут возможно нужен идентификатор кастера и рауд ?
  target.flags.isParalysed = true;
};
module.exports = paralysis;
