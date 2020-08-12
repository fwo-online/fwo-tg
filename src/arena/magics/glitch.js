const CommonMagic = require('../Constuructors/CommonMagicConstructor');
/**
 * Благословение
 * Основное описание магии общее требовани есть в конструкторе
 */

/**
 * @typedef {import ('../GameService')} game
 * @typedef {import ('../PlayerService').default} player
 */

const glitch = new CommonMagic({
  name: 'glitch',
  displayName: 'Глюки',
  desc: 'Глюки, вводит цель в замешательство, цель атакуют любого из игроков',
  cost: 12,
  baseExp: 80,
  costType: 'mp',
  lvl: 2,
  orderType: 'all',
  aoeType: 'target',
  magType: 'bad',
  chance: ['1d80', '1d90', '1d100'],
  profList: ['m'],
});

/**
 * Основная функция запуска магии
 * @param {player} initiator Обьект кастера
 * @param {player} target Обьект цели
 * @param {game} game Обьект игры (не обязателен)
 */
glitch.run = function run(_initiator, target, _game) {
  target.flags.isGlitched = true;
};
module.exports = glitch;
