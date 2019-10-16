const LongMagic = require('../Constuructors/LongMagicConstructor');
/**
 * Малая аура
 * Основное описание магии общее требовани есть в конструкторе
 */
const mediumAura = new LongMagic({
  name: 'mediumAura',
  desc: 'Создает вокруг цели среднюю ауру',
  cost: 6,
  baseExp: 6,
  costType: 'mp',
  lvl: 1,
  orderType: 'self',
  aoeType: 'target',
  magType: 'good',
  chance: [100, 100, 100],
  effect: ['1d4+4', '1d3+5', '1d2+6'],
  profList: ['m'],
});
/**
 * Основная функция запуска магии
 * @param {Object} initiator Обьект кастера
 * @param {Object} target Обьект цели
 */
mediumAura.longRun = function mediumAura(initiator, target) {
  target.stats.mode('up', 'pdef', this.effectVal(initiator));
};
module.exports = mediumAura;

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
