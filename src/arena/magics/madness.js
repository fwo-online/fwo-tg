const CommonMagic = require('../Constuructors/CommonMagicConstructor');
/**
 * Безумие
 * Основное описание магии общее требовани есть в конструкторе
 */

/**
 * @typedef {import ('../GameService')} game
 * @typedef {import ('../PlayerService')} player
 */

const madness = new CommonMagic({
  name: 'madness',
  desc: 'Заставляет цель атаковать саму себя',
  cost: 10,
  baseExp: 80,
  costType: 'mp',
  lvl: 2,
  orderType: 'enemy',
  aoeType: 'target',
  magType: 'bad',
  chance: ['1d75', '1d80', '1d82'],
  profList: ['m'],
});

/**
 * Основная функция запуска магии
 * @param {player} initiator Обьект кастера
 * @param {player} target Обьект цели
 * @param {game} game Обьект игры (не обязателен)
 */
// eslint-disable-next-line no-unused-vars
madness.run = function run(initiator, target, game) {
  // тут возможно нужен идентификатор кастера и рауд ?
  // eslint-disable-next-line no-param-reassign
  target.flags.isMad = true;
};
module.exports = madness;
