import { DmgMagic } from './DmgMagicConstructor';
import type { ActionType } from './types';

export abstract class AoeDmgMagic extends DmgMagic {
  actionType: ActionType = 'aoe-dmg-magic';

  calculateExp({ initiator, target, game } = this.params): void {
    super.calculateExp({ initiator, target, game });
    this.calculateAoeExp();
  }

  calculateAoeExp() {
    this.status.expArr.forEach((item) => {
      item.exp = this.getEffectExp(item.val ?? 0);
    });
  }
}
