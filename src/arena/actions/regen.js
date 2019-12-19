/**
 * Класс регенирации
 */

/**
 * @typedef {import ('../GameService')} game
 * @typedef {import ('../PlayerService')} player
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
   * @param {player} initiator Обьект кастера
   * @param {player} target Обьект цели
   * @param {game} game Обьект игры (не обязателен)
   */
  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  cast(initiator, target, game) {
    const val = initiator.stats.val('manaReg') * initiator.proc; // размер восстан
    initiator.stats.mode('up', 'mp', val);
  }
}

module.exports = new Regen();
