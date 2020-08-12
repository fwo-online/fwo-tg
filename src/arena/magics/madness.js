const CommonMagic = require('../Constuructors/CommonMagicConstructor');
/**
 * Безумие
 * Основное описание магии общее требовани есть в конструкторе
 */

/**
 * @typedef {import ('../GameService')} game
 * @typedef {import ('../PlayerService').default} player
 */

const madness = new CommonMagic({
  name: 'madness',
  displayName: 'Безумие',
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
madness.run = function run(_initiator, target, _game) {
  target.flags.isMad = true;
};
module.exports = madness;
