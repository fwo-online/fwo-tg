import type { OrderType, ActionType } from '@/arena/Constuructors/types';
import type Game from '@/arena/GameService';
import type { Player } from '@/arena/PlayersService';
import type { PreAffect } from '../Constuructors/interfaces/PreAffect';
import { ProtectConstructor } from '../Constuructors/ProtectConstructor';

/**
 * Класс защиты
 */
class Protect extends ProtectConstructor implements PreAffect {
  name = 'protect';
  displayName = 'Защита';
  desc = 'Защита от физических атак';
  lvl = 0;
  orderType: OrderType = 'all';
  actionType: ActionType = 'protect';

  run(initiator: Player, target: Player, _game: Game) {
    const protectValue = initiator.stats.val('pdef') * initiator.proc;
    target.stats.up('def', protectValue);
    target.flags.isProtected.push({
      initiator: initiator.id, val: protectValue,
    });
  }

  getTargetProtectors({ target } = this.params) {
    return target.flags.isProtected;
  }
}

export default new Protect();
