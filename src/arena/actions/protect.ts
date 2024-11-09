import type { OrderType, ActionType } from '@/arena/Constuructors/types';
import type Game from '@/arena/GameService';
import type { Player } from '@/arena/PlayersService';
import { ProtectConstructor } from '../Constuructors/ProtectConstructor';

/**
 * Класс защиты
 */
class Protect extends ProtectConstructor {
  name = 'protect';
  displayName = 'Защита';
  desc = 'Защита от физических атак';
  lvl = 0;
  orderType: OrderType = 'all';
  actionType: ActionType = 'protect';

  run(initiator: Player, target: Player, _game: Game) {
    const protectValue = initiator.stats.val('phys.defence') * initiator.proc;
    target.stats.up('phys.defence', protectValue);
    target.flags.isProtected.push({
      initiator: initiator.id, val: protectValue,
    });
  }

  getTargetProtectors({ target } = this.params) {
    return target.flags.isProtected;
  }
}

export default new Protect();
