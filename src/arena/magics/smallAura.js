const LongMagic = require('../Constuructors/LongMagicConstructor');
/**
 * Малая аура
 * Основное описание магии общее требовани есть в конструкторе
 */

/** @typedef {import ('../PlayerService')} player */

const smallAura = new LongMagic({
  name: 'smallAura',
  desc: 'Создает вокруг цели слабую ауру',
  cost: 3,
  baseExp: 6,
  costType: 'mp',
  lvl: 1,
  orderType: 'self',
  aoeType: 'target',
  magType: 'good',
  chance: [100, 100, 100],
  effect: ['1d4+2', '1d3+3', '1d2+4'],
  profList: ['m'],
});
/**
 * Основная функция запуска магии
 * @param {player} initiator Обьект кастера
 * @param {player} target Обьект цели
 */
smallAura.longRun = function longRun(initiator, target) {
  target.stats.mode('up', 'pdef', this.effectVal(initiator));
};
module.exports = smallAura;

/**
 * @todo longmagic:
 * buff:
 * <floodbot> [1 из 7] ReaL благословило ReaL на 6.00pt. (e:+7/67)
 * dmg magic:
 * [1 из 7] qwadro заклинанием <Усыхание> состарил ReaL, и лишил это
 * 21.77hp. (h:-21.77/37.99, e:+174/274)
 *
 * logic: Если шанс прохождения длительной магии успешен, цель получает
 * buff, на N (longspell у Player) раундов. Каждый раунд так же выполняется
 * проверка прохождения.
 */
