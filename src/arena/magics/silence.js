// import CommonMagic from './CommonMagic';
const CommonMagic = require('../Constuructors/CommonMagicConstructor');
/**
 * Безмолвие
 * Основное описание магии общее требовани есть в конструкторе
 */

/**
 * @typedef {import ('../GameService')} game
 * @typedef {import ('../PlayerService')} player
 */

const silence = new CommonMagic({
  name: 'silence',
  cost: 16,
  baseExp: 80,
  costType: 'mp',
  lvl: 4,
  orderType: 'all',
  aoeType: 'target',
  magType: 'bad',
  chance: ['1d60', '1d70', '1d85'],
  profList: ['m'],
});

/**
 * Основная функция запуска магии
 * @param {player} initiator Обьект кастера
 * @param {player} target Обьект цели
 * @param {game} game Обьект игры (не обязателен)
 */
// eslint-disable-next-line no-unused-vars
silence.run = function run(initiator, target, game) {
  const s = target.flags.isSilenced || [];
  s.push({
    initiator: initiator.nick,
    action: 'silence',
  });
};
module.exports = silence;
