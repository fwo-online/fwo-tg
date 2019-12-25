const CommonMagic = require('../Constuructors/CommonMagicConstructor');
/**
 * Снятие магии
 * Основное описание магии общее требовани есть в конструкторе
 */

/**
 * @typedef {import ('../GameService')} game
 * @typedef {import ('../PlayerService')} player
 */

const dispel = new CommonMagic({
  name: 'dispel',
  displayName: 'Рассеивание',
  desc: 'Снимает все длительные магии с цели',
  cost: 18,
  baseExp: 80,
  costType: 'mp',
  lvl: 2,
  orderType: 'all',
  aoeType: 'target',
  magType: 'bad',
  chance: ['1d60', '1d70', '1d85'],
  profList: ['p'],
});

/**
 * Основная функция запуска магии
 * @param {player} initiator Обьект кастера
 * @param {player} target Обьект цели
 * @param {game} game Обьект игры (не обязателен)
 */
dispel.run = function run(initiator, target, game) {
  // тут нужно во всех обьектах длительных магий искать target:target
  // и удалять
  // eslint-disable-next-line no-console
  console.log('longMagic:debug:Array:', game.longActions);
};
module.exports = dispel;
