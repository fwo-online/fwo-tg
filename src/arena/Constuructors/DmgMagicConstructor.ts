import { floatNumber } from '../../utils/floatNumber';
import type { Player } from '../PlayersService';
import type { MagicArgs } from './MagicConstructor';
import { Magic } from './MagicConstructor';
import type {
  ActionType, DamageType,
} from './types';

export interface DmgMagicArgs extends MagicArgs {
  dmgType: DamageType;
}

export interface DmgMagic extends DmgMagicArgs, Magic {
}
/**
 * Общий конструктор не длительных магий
 */
export abstract class DmgMagic extends Magic {
  actionType: ActionType = 'dmg-magic';
  /**
   * Создание магии
   */
  constructor({ dmgType, ...magObj }: DmgMagicArgs) {
    super(magObj);
    this.dmgType = dmgType;
    this.effectType = dmgType;
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
    effect = this.applyCasterModifiers(effect, initiator);

    if (this.dmgType !== 'clear') {
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
}
