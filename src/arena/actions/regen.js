/**
 * Класс регенирации
 */
class Regen {
  /**
   * Изменяем состояние цели, создаем custom run
   */
  constructor() {
    this.name = 'regeneration';
    this.desc = 'Регенирация маны/энергии';
    this.lvl = 0;
    this.orderType = 'self';
  }

  /**
   * Каст регенирации
   * Регенирация срабатывает даже при атаке на цель
   * @param {Object} initiator Обьект кастера
   * @param {Object} target Обьект цели
   * @param {Object} game Обьект игры (не обязателен)
   */
  // eslint-disable-next-line no-unused-vars
  cast(initiator, target, game) {
    const val = initiator.stats.val('manaReg') * initiator.proc; // размер восстан
    initiator.stats.mode('up', 'mp', val);
  }
}

module.exports = new Regen();
