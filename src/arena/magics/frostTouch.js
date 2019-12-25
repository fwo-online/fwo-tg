const LongDmgMagic = require('../Constuructors/LongDmgMagicConstructor');
/**
 * Ледяное прикосновение
 * Основное описание магии общее требовани есть в конструкторе
 */

/**
 * @typedef {import ('../GameService')} game
 * @typedef {import ('../PlayerService')} player
 */

const frostTouch = new LongDmgMagic({
  name: 'frostTouch',
  displayName: 'Ледяное прикосновение',
  desc: 'Поражает цель ледяным касанием, отнимая жизни. (длительная)',
  cost: 3,
  baseExp: 16,
  costType: 'mp',
  lvl: 1,
  orderType: 'enemy',
  aoeType: 'target',
  magType: 'bad',
  chance: [92, 94, 95],
  effect: ['1d2', '1d2+1', '1d2+2'],
  dmgType: 'ice',
  profList: ['m'],
});
/**
 * Основная функция запуска магии
 * @param {player} initiator Обьект кастера
 * @param {player} target Обьект цели
 */
frostTouch.longRun = function longRun(initiator, target) {
  target.stats.mode('down', 'hp', this.effectVal(initiator));
};
module.exports = frostTouch;
