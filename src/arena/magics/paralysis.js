const CommonMagic = require('../Constuructors/CommonMagicConstructor');
/**
 * Паралич
 * Основное описание магии общее требовани есть в конструкторе
 */
const paralysis = new CommonMagic({
  name: 'paralysis',
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
 * @param {Object} initiator Обьект кастера
 * @param {Object} target Обьект цели
 * @param {Object} game Обьект игры (не обязателен)
 */
// eslint-disable-next-line no-unused-vars
paralysis.run = (initiator, target, game) => {
  // тут возможно нужен идентификатор кастера и рауд ?
  // eslint-disable-next-line no-param-reassign
  target.flags.isParalysed = true;
};
module.exports = paralysis;
