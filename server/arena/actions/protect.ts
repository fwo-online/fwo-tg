import { OrderType } from '@fwo/shared';
import type { ActionType } from '@/arena/Constuructors/types';
import { ProtectConstructor } from '../Constuructors/ProtectConstructor';

/**
 * Класс защиты
 */
class Protect extends ProtectConstructor {
  name = 'protect' as const;
  displayName = 'Защита';
  desc = 'Защита от физических атак';
  lvl = 0;
  orderType = OrderType.All;
  actionType: ActionType = 'protect';

  run() {
    const { initiator, target } = this.params;
    const protectValue = initiator.stats.val('phys.defence') * initiator.proc;
    target.stats.up('phys.defence', protectValue);

    target.affects.addEffect({
      action: this.name,
      initiator,
      value: protectValue,
      proc: initiator.proc,
      onBeforeReceive(ctx, action) {
        protect.onBeforeReceive(ctx, action);
      },
    });
  }
}

export const protect = new Protect();
