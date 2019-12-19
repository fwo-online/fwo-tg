const DmgMagic = require('../Constuructors/DmgMagicConstructor');
/**
 * Огненный дождь
 * Основное описание магии общее требовани есть в конструкторе
 */

/**
 * @typedef {import ('../PlayerService')} player
 */

const fireRain = new DmgMagic({
  name: 'fireRain',
  desc: 'Обрушивает на команду противника огненный дождь',
  cost: 18,
  baseExp: 8,
  costType: 'mp',
  lvl: 3,
  orderType: 'enemy',
  aoeType: 'team',
  magType: 'bad',
  chance: [92, 94, 95],
  effect: ['1d2', '1d2+2', '1d2+4'],
  dmgType: 'fire',
  profList: ['m'],
});
/**
 * Основная функция запуска магии
 * @param {player} initiator Обьект кастера
 * @param {player} target Обьект цели
 */
// eslint-disable-next-line no-unused-vars
fireRain.run = function run(initiator, target) {
  // Наносит урон всем участникам команды цели
};
module.exports = fireRain;
