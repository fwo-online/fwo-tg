const CommonMagic = require('../Constuructors/CommonMagicConstructor');
/**
 * Благословение
 * Основное описание магии общее требовани есть в конструкторе
 */
const exorcism = new CommonMagic({
  name: 'exorcism',
  desc: 'Экзорцизм снимает все отрицательные эффекты с цели',
  cost: 20,
  baseExp: 80,
  costType: 'mp',
  lvl: 3,
  orderType: 'enemy',
  aoeType: 'target',
  magType: 'good',
  chance: ['1d60', '1d70', '1d80'],
  profList: ['m'],
});

/**
 * Основная функция запуска магии
 * @param {Object} initiator Обьект кастера
 * @param {Object} target Обьект цели
 * @param {Object} game Обьект игры (не обязателен)
 */
// eslint-disable-next-line no-unused-vars
exorcism.run = function run(initiator, target, game) {
  // Очищаем все "bad" магии в которых target является target данной магии
};
module.exports = exorcism;
