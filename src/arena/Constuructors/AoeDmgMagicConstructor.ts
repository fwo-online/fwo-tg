import { floatNumber } from '../../utils/floatNumber';
import { DmgMagic } from './DmgMagicConstructor';
import type { BaseNext, DamageType, ExpArr } from './types';

export type AoeDmgMagicNext = BaseNext & {
  actionType: 'aoe-dmg-magic'
  dmg: number;
  hp: number;
  dmgType: DamageType;
  expArr: ExpArr;
}

export abstract class AoeDmgMagic extends DmgMagic {
  status: {
    exp: number;
    expArr: ExpArr;
    hit: number;
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

  resetStatus(): void {
    this.status = {
      exp: 0,
      hit: 0,
      expArr: [],
    };
  }

  /**
   * Магия прошла удачно
   * @param initiator объект персонажаы
   * @param target объект цели магии
   * @todo тут нужен вывод требуемых параметров
   */
  next(): void {
    const { game, target } = this.params;
    const args: AoeDmgMagicNext = {
      ...this.getNextArgs(),
      actionType: 'aoe-dmg-magic',
      expArr: this.status.expArr,
      dmg: floatNumber(this.status.hit),
      hp: target.stats.val('hp'),
      dmgType: this.dmgType,
    };

    game.addHistoryDamage(args);
    game.battleLog.success(args);
  }
}
