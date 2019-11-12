const CommonMagic = require('../Constuructors/CommonMagicConstructor');
/**
 * Благословение
 * Основное описание магии общее требовани есть в конструкторе
 */
const eclipse = new CommonMagic({
  name: 'eclipse',
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
 * @param {Object} initiator Обьект кастера
 * @param {Object} target Обьект цели
 * @param {Object} game Обьект игры (не обязателен)
 */
eclipse.run = function run(initiator, target, game) {
  // выставляем глобальный флаг затмения
  // eslint-disable-next-line no-param-reassign
  game.round.flags.isEclipsed = true;
};
module.exports = eclipse;
