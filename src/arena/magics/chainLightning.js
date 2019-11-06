// @todo
const DmgMagic = require('../Constuructors/DmgMagicConstructor');
/**
 * Цепная молния
 * Основное описание магии общее требовани есть в конструкторе
 */
const chainLightning = new DmgMagic({
  name: 'chainLightning',
  desc: 'Цепная молния повреждает выбраную цель молнией и еще одну случайно.',
  cost: 8,
  baseExp: 12,
  costType: 'mp',
  lvl: 3,
  orderType: 'any',
  aoeType: 'targetAoe',
  magType: 'bad',
  chance: [92, 94, 95],
  effect: ['1d3+1', '1d3+2', '1d3+3'],
  dmgType: 'light',
  profList: ['m'],
});

/**
 * Основная функция запуска магии
 * @param {Object} initiator Обьект кастера
 * @param {Object} target Обьект цели
 */
chainLightning.run = (initiator, target) => {
  target.stats.mode('down', 'hp', this.effectVal(initiator));
};
module.exports = chainLightning;
