import { DmgMagic } from './DmgMagicConstructor';
import type { ActionType } from './types';

export abstract class AoeDmgMagic extends DmgMagic {
  actionType: ActionType = 'aoe-dmg-magic';

  getExp({ initiator, target, game } = this.params): void {
    super.getExp({ initiator, target, game });
    this.getAoeExp({ initiator, target, game });
  }

  getAoeExp({ initiator } = this.params) {
    this.status.expArr.forEach((item) => {
      const exp = this.calculateExp(item.val ?? 0);

      item.exp = exp;
      initiator.stats.up('exp', exp);
    });
  }

  checkTargetIsDead({ initiator, target, game } = this.params): void {
    super.checkTargetIsDead({ initiator, target, game });
    this.checkAoeTargetIsDead({ initiator, target, game });
  }

  checkAoeTargetIsDead({ initiator, game } = this.params): void {
    this.status.expArr.forEach(({ id }) => {
      const target = game.players.getById(id);
      if (!target) {
        return;
      }
      super.checkTargetIsDead({ initiator, target, game });
    });
  }
}
