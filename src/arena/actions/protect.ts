import type { OrderType } from '../Constuructors/types';
import type Game from '../GameService';
import type { Player } from '../PlayersService';

/**
 * Класс защиты
 */

class Protect {
  name: string;
  displayName: string;
  desc: string;
  lvl: number;
  orderType: OrderType;
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
   * @param {player} initiator Объект кастера
   * @param {player} target Объект цели
   * @param {game} [game] Объект игры
   */
  // eslint-disable-next-line class-methods-use-this
  cast(initiator: Player, target: Player, _game: Game) {
    const tect = initiator.stats.val('pdef') * initiator.proc;
    target.stats.up('pdef', tect);
    target.flags.isProtected.push({
      initiator: initiator.id, val: tect,
    });
  }
}

export default new Protect();
