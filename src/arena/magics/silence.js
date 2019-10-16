// import CommonMagic from './CommonMagic';
const CommonMagic = require('../Constuructors/CommonMagicConstructor');
/**
 * Безмолвие
 * Основное описание магии общее требовани есть в конструкторе
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
 * @param {Object} initiator Обьект кастера
 * @param {Object} target Обьект цели
 * @param {Object} game Обьект игры (не обязателен)
 */
silence.run = (initiator, target, game) => {
  let s = target.flags.isSilenced || [];
  s.push({
    initiator: initiator.name,
    action: 'silence',
  });
};
module.exports = silence;
