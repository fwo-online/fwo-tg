const CommonMagic = require('../Constuructors/CommonMagicConstructor');
/**
 * Безумие
 * Основное описание магии общее требовани есть в конструкторе
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
 * @param {Object} initiator Обьект кастера
 * @param {Object} target Обьект цели
 * @param {Object} game Обьект игры (не обязателен)
 */
madness.run = (initiator, target, game) => {
  // тут возможно нужен идентификатор кастера и рауд ?
  // eslint-disable-next-line no-param-reassign
  target.flags.isMad = true;
};
module.exports = madness;
