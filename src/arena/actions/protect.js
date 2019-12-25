/**
 * Класс защиты
 */

/**
 * @typedef {import ('../GameService')} game
 * @typedef {import ('../PlayerService')} player
 */

class Protect {
  /**
   * Изменяем протект цели, создаем custom run
   */
  constructor() {
    this.name = 'protect';
    this.displayName = 'Защита';
    this.desc = 'Защита от физических атак';
    this.lvl = 0;
    this.orderType = 'all';
  }

  /**
   * Каст протекта
   * @param {player} initiator Обьект кастера
   * @param {player} target Обьект цели
   * @param {game} [game] Обьект игры
   */
  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  cast(initiator, target, game) {
    const tect = initiator.stats.val('pdef') * initiator.proc;
    target.stats.mode('up', 'pdef', tect);
    target.flags.isProtected.push({
      initiator: initiator.id, val: tect,
    });
  }
}

module.exports = new Protect();
