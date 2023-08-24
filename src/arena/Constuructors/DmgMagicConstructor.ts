import { floatNumber } from '../../utils/floatNumber';
import MiscService from '../MiscService';
import { Magic, MagicArgs } from './MagicConstructor';
import type { BaseNext, DamageType, ExpArr } from './types';

export type DmgMagicNext = BaseNext & {
  actionType: 'dmg-magic'
  dmg: number;
  hp: number;
  dmgType: DamageType;
}

export interface DmgMagicArgs extends MagicArgs {
  dmgType: DamageType;
}

export interface DmgMagic extends DmgMagicArgs, Magic {
}
/**
 * Общий конструктор не длительных магий
 */
export abstract class DmgMagic extends Magic {
  status: {
    exp: number;
    expArr?: ExpArr;
    hit: number;
  } = {
      exp: 0,
      hit: 0,
    };

  /**
   * Создание магии
   */
  constructor({ dmgType, ...magObj }: DmgMagicArgs) {
    super(magObj);
    this.dmgType = dmgType;
  }

  /**
   * Возвращает шанс прохождения магии
   */
  effectVal({ initiator, target } = this.params): number {
    const initiatorMagicLvl = initiator.magics[this.name];
    let eff = MiscService.dice(this.effect[initiatorMagicLvl - 1]) * initiator.proc;
    if (this.dmgType !== 'clear') {
      // правим урон от mgp цели и mga кастера
      eff = eff * (1 + 0.004 * initiator.stats.val('mga'))
          * (1 - 0.002 * target.stats.val('mgp'));
      const resist = target.resists[this.dmgType];
      if (resist) {
        eff *= resist;
      }
    }
    if (this.isAoe) {
      this.status.hit += eff;
    } else {
      this.status.hit = eff;
    }
    return eff;
  }

  /**
   * Функция списывающая с кастера требуемое
   * кол-во единиц за использование магии
   * Если кастеру хватило mp/en продолжаем,если нет, то возвращаем false
   */
  getExp({ initiator, target, game } = this.params): void {
    if (game.isPlayersAlly(initiator, target) && !initiator.flags.isGlitched) {
      this.status.exp = 0;
    } else {
      const dmgExp = Math.round(this.status.hit * 8) + this.baseExp;
      this.status.exp = dmgExp;

      initiator.stats.up('exp', dmgExp);
    }
  }

  /**
   * Магия прошла удачно
   * @param initiator объект персонажаы
   * @param target объект цели магии
   * @todo тут нужен вывод требуемых параметров
   */
  next(): void {
    const { game, target } = this.params;
    const args: DmgMagicNext = {
      ...this.getNextArgs(),
      actionType: 'dmg-magic',
      dmg: floatNumber(this.status.hit),
      hp: target.stats.val('hp'),
      dmgType: this.dmgType,
    };

    game.addHistoryDamage(args);
    game.battleLog.success(args);

    this.status = {
      exp: 0,
      hit: 0,
    };
  }
}
