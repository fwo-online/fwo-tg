import { OrderType } from '@fwo/shared';
import { BaseAction } from '@/arena/Constuructors/BaseAction';
import type { ActionType } from '../Constuructors/types';
import type Game from '../GameService';
import type { Player } from '../PlayersService';

/**
 * Класс регенерации
 */

class Regeneration extends BaseAction {
  name = 'regeneration' as const;
  displayName = 'Восстановление';
  desc = 'Регенерация маны/энергии';
  lvl = 0;
  orderType = OrderType.Self;
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
    this.createContext(initiator, target, game);
    this.run(initiator, target, game);
  }

  run(initiator: Player, _target: Player, _game: Game) {
    if (initiator.prof === 'l' || initiator.prof === 'w') {
      const val = initiator.stats.val('regen.en') * initiator.proc; // размер восстан
      initiator.stats.up('en', Math.min(val, initiator.stats.val('base.en')));
    } else {
      const val = initiator.stats.val('regen.mp') * initiator.proc; // размер восстан
      initiator.stats.up('mp', Math.min(val, initiator.stats.val('base.mp')));
    }
  }
}
export default new Regeneration();
