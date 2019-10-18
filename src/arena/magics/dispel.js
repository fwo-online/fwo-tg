const CommonMagic = require('../Constuructors/CommonMagicConstructor');
/**
 * Снятие магии
 * Основное описание магии общее требовани есть в конструкторе
 */
const dispel = new CommonMagic({
  name: 'dispel',
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
 * @param {Object} initiator Обьект кастера
 * @param {Object} target Обьект цели
 * @param {Object} game Обьект игры (не обязателен)
 */
dispel.run = (initiator, target, game) => {
  // тут нужно во всех обьектах длительных магий искать target:target
  // и удалять
  sails.log('longMagic:debug:Array:', game.longActions);
};
module.exports = dispel;
