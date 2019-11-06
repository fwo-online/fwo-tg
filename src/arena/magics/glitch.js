const CommonMagic = require('../Constuructors/CommonMagicConstructor');
/**
 * Благословение
 * Основное описание магии общее требовани есть в конструкторе
 */
const glitch = new CommonMagic({
  name: 'glitch',
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
 * @param {Object} initiator Обьект кастера
 * @param {Object} target Обьект цели
 * @param {Object} game Обьект игры (не обязателен)
 */
// eslint-disable-next-line no-unused-vars
glitch.run = (initiator, target, game) => {
  // тут возможно нужен идентификатор кастера и рауд ?
  // eslint-disable-next-line no-param-reassign
  target.flags.isGlitched = true;
};
module.exports = glitch;
