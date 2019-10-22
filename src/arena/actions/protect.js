/**
 * Класс защиты
 */
class Protect {
  /**
   * Изменяем протект цели, создаем custom run
   */
  constructor() {
    this.name = 'protect';
    this.desc = 'Защита от физических атак';
    this.lvl = 0;
    this.orderType = 'all';
  }

  /**
   * Каст протекта
   * @param {Object} initiator Обьект кастера
   * @param {Object} target Обьект цели
   * @param {Object} game Обьект игры (не обязателен)
   */
  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  cast(initiator, target, game) {
    const tect = initiator.stats.val('pdef') * initiator.proc;
    target.stats.mode('up', 'def', tect);
    target.flags.isProtected.push({
      initiator: initiator.id, val: tect,
    });
  }
}

module.exports = new Protect();
