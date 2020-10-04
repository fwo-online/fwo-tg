const LongMagic = require('../Constuructors/LongMagicConstructor');
/**
 * Сильная аура
 * Основное описание магии общее требовани есть в конструкторе
 */

/** @typedef {import ('../PlayerService').default} player */

const smallAura = new LongMagic({
  name: 'smallAura',
  displayName: 'Сильная аура',
  desc: 'Создает вокруг цели слабую ауру',
  cost: 8,
  baseExp: 6,
  costType: 'mp',
  lvl: 2,
  orderType: 'self',
  aoeType: 'target',
  magType: 'good',
  chance: [100, 100, 100],
  effect: ['1d4+6', '1d3+7', '1d2+8'],
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
