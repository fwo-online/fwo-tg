const CommonMagic = require('../Constuructors/CommonMagicConstructor');
/**
 * Благословение
 * Основное описание магии общее требовани есть в конструкторе
 */

/**
 * @typedef {import ('../GameService')} game
 * @typedef {import ('../PlayerService')} player
 */
const eclipse = new CommonMagic({
  name: 'eclipse',
  displayName: 'Затмение',
  desc: 'Глюки, вводит цель в замешательство, цель атакуют любого из игроков',
  cost: 16,
  baseExp: 80,
  costType: 'mp',
  lvl: 2,
  orderType: 'enemy',
  aoeType: 'target',
  magType: 'bad',
  chance: ['1d80', '1d90+5', '1d100+5'],
  profList: ['m'],
});

/**
 * Основная функция запуска магии
 * @param {player} initiator Обьект кастера
 * @param {player} target Обьект цели
 * @param {game} game Обьект игры (не обязателен)
 */
eclipse.run = function run(initiator, target, game) {
  // выставляем глобальный флаг затмения
  game.round.flags.isEclipsed = true;
};
module.exports = eclipse;
