import { AffectableAction } from '../Constuructors/AffectableAction';
import type { ActionType, OrderType } from '../Constuructors/types';
import type Game from '../GameService';
import type { Player } from '../PlayersService';

/**
 * Класс регенерации
 */

class Regeneration extends AffectableAction {
  name = 'regeneration';
  displayName = 'Восстановление';
  desc = 'Регенерация маны/энергии';
  lvl = 0;
  orderType: OrderType = 'self';
  actionType: ActionType = 'regeneration';

  /**
   * Каст регенерации
   * Регенерация срабатывает даже при атаке на цель
   * @param initiator Объект кастера
   * @param target Объект цели
   * @param game Объект игры (не обязателен)
   */
  // eslint-disable-next-line class-methods-use-this
  cast(initiator: Player, target: Player, game: Game) {
    this.createContext(initiator, target, game)
    this.run(initiator, target, game)
  }

  run(initiator: Player, _target: Player, _game: Game) {
    if (initiator.prof === 'l' || initiator.prof === 'w') {
      const val = initiator.stats.val('regen.en') * initiator.proc; // размер восстан
      initiator.stats.up('en', val);
    } else {
      const val = initiator.stats.val('regen.mp') * initiator.proc; // размер восстан
      initiator.stats.up('mp', val);
    }
  }
}
export default new Regeneration();
