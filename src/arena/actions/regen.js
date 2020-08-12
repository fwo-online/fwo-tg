/**
 * Класс регенирации
 */

/**
 * @typedef {import ('../GameService')} game
 * @typedef {import ('../PlayerService').default} player
 */

class Regen {
  /**
   * Изменяем состояние цели, создаем custom run
   */
  constructor() {
    this.name = 'regeneration';
    this.displayName = 'Восстановление';
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
  // eslint-disable-next-line class-methods-use-this
  cast(initiator, _target, _game) {
    if ((initiator.prof === 'l') || (initiator.prof === 'w')) {
      const val = initiator.stats.val('enReg') * initiator.proc; // размер восстан
      initiator.stats.mode('up', 'en', val);
    } else {
      const val = initiator.stats.val('manaReg') * initiator.proc; // размер восстан
      initiator.stats.mode('up', 'mp', val);
    }
  }
}

module.exports = new Regen();
