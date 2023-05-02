import type { OrderType } from '../Constuructors/types';
import type Game from '../GameService';
import type { Player } from '../PlayersService';

/**
 * Класс регенерации
 */

class Regeneration {
  name: string;
  displayName: string;
  desc: string;
  lvl: number;
  orderType: OrderType;
  /**
   * Изменяем состояние цели, создаем custom run
   */
  constructor() {
    this.name = 'regeneration';
    this.displayName = 'Восстановление';
    this.desc = 'Регенерация маны/энергии';
    this.lvl = 0;
    this.orderType = 'self';
  }

  /**
   * Каст регенерации
   * Регенерация срабатывает даже при атаке на цель
   * @param initiator Объект кастера
   * @param target Объект цели
   * @param game Объект игры (не обязателен)
   */
  // eslint-disable-next-line class-methods-use-this
  cast(initiator: Player, _target: Player, _game: Game) {
    if ((initiator.prof === 'l') || (initiator.prof === 'w')) {
      const val = initiator.stats.val('reg_en') * initiator.proc; // размер восстан
      initiator.stats.up('en', val);
    } else {
      const val = initiator.stats.val('reg_mp') * initiator.proc; // размер восстан
      initiator.stats.up('mp', val);
    }
  }
}
export default new Regeneration();
