/**
 * Класс защиты
 */

/**
 * @typedef {import ('../GameService').default} game
 * @typedef {import ('../PlayerService').default} player
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
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  cast(initiator, target, _game) {
    const tect = initiator.stats.val('pdef') * initiator.proc;
    target.stats.mode('up', 'pdef', tect);
    target.flags.isProtected.push({
      initiator: initiator.id, val: tect,
    });
  }
}

module.exports = new Protect();
