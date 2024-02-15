import { floatNumber } from '../../utils/floatNumber';
import { DmgMagic } from './DmgMagicConstructor';
import type {
  ActionType,
  BaseNext, DamageType, ExpArr, SuccessArgs,
} from './types';

export type AoeDmgMagicNext = BaseNext & {
  actionType: 'aoe-dmg-magic'
  dmg: number;
  hp: number;
  dmgType: DamageType;
  expArr: ExpArr;
}

export abstract class AoeDmgMagic extends DmgMagic {
  actionType: ActionType = 'aoe-dmg-magic';

  status: {
    exp: number;
    expArr: ExpArr;
    effect: number;
  };

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

  reset(): void {
    super.reset();

    this.status = {
      exp: 0,
      effect: 0,
      expArr: [],
    };
  }

  getSuccessResult({ initiator, target } = this.params): SuccessArgs {
    const result: AoeDmgMagicNext = {
      exp: this.status.exp,
      action: this.displayName,
      target: target.nick,
      initiator: initiator.nick,
      actionType: 'aoe-dmg-magic',
      expArr: this.status.expArr,
      dmg: floatNumber(this.status.effect),
      hp: target.stats.val('hp'),
      dmgType: this.dmgType,
    };

    this.reset();

    return result;
  }
}
