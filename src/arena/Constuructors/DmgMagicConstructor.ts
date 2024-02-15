import { floatNumber } from '../../utils/floatNumber';
import type { Player } from '../PlayersService';
import type { MagicArgs } from './MagicConstructor';
import { Magic } from './MagicConstructor';
import type { BaseNext, DamageType, SuccessArgs } from './types';

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
  effectVal({ initiator, target, game } = this.params): number {
    const effect = this.getEffectVal({ initiator, target, game });
    const modifiedEffect = this.modifyEffect(effect, { initiator, target, game });

    this.status.effect = modifiedEffect;

    return modifiedEffect;
  }

  modifyEffect(effect: number, { initiator, target } = this.params): number {
    if (this.dmgType !== 'clear') {
      effect = this.applyCasterModifiers(effect, initiator);
      effect = this.applyTargetModifiers(effect, target);
      effect = this.applyResists(effect, target);
    }

    return floatNumber(effect);
  }

  applyCasterModifiers(effect: number, initiator: Player): number {
    return effect * (1 + 0.004 * initiator.stats.val('mga'));
  }

  applyTargetModifiers(effect: number, target: Player): number {
    return effect * (1 - 0.002 * target.stats.val('mgp'));
  }

  applyResists(effect: number, target: Player): number {
    const resist = target.resists[this.dmgType];
    if (resist) {
      return effect * resist;
    }
    return effect;
  }

  /**
   * Функция списывающая с кастера требуемое
   * кол-во единиц за использование магии
   * Если кастеру хватило mp/en продолжаем,если нет, то возвращаем false
   */
  getExp({ initiator, target } = this.params): void {
    if (initiator.isAlly(target) && !initiator.flags.isGlitched) {
      this.status.exp = 0;
    } else {
      const dmgExp = this.calculateExp(this.status.effect, this.baseExp);
      this.status.exp = dmgExp;

      initiator.stats.up('exp', dmgExp);
    }
  }

  calculateExp(hit: number, baseExp = 0) {
    return Math.round(hit * 8) + baseExp;
  }

  reset(): void {
    this.status = {
      exp: 0,
      effect: 0,
    };
  }

  getSuccessResult({ initiator, target } = this.params): SuccessArgs {
    const result: DmgMagicNext = {
      exp: this.status.exp,
      action: this.displayName,
      actionType: 'dmg-magic',
      target: target.nick,
      initiator: initiator.nick,
      msg: this.customMessage?.bind(this),
      dmg: floatNumber(this.status.effect),
      hp: target.stats.val('hp'),
      dmgType: this.dmgType,
    };

    this.reset();

    return result;
  }
}
