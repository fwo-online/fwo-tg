import type { CostType, Magic as MagicSchema, OrderType } from '@fwo/shared';
import type { ActionKey } from '@/arena/ActionService';
import { BaseAction } from '@/arena/Constuructors/BaseAction';
import MiscService from '@/arena/MiscService';
import { floatNumber } from '../../utils/floatNumber';
import CastError from '../errors/CastError';
import type Game from '../GameService';
import type { Player } from '../PlayersService';
import type { ActionType, CustomMessage } from './types';

export interface MagicArgs {
  name: ActionKey;
  displayName: string;
  desc: string;
  cost: number;
  costType: 'mp' | 'en';
  lvl: number;
  orderType: OrderType;
  aoeType: 'target' | 'team' | 'targetAoe';
  baseExp: number;
  effect: string[];
  magType: 'bad' | 'good';
  chance: number[] | string[];
  profList: string[];
}

/**
 * Конструктор магии
 */
export interface Magic extends MagicArgs, CustomMessage {}

export abstract class Magic extends BaseAction {
  actionType: ActionType = 'magic';

  isLong = false;

  /**
   * Создание магии
   * @param magObj Объект создаваемой магии
   */
  constructor(magObj: MagicArgs) {
    super();

    Object.assign(this, magObj);
    this.reset();
  }

  // Дальше идут общие методы для всех магий
  /**
   * Общий метод каста магии
   * в нём выполняются общие функции для всех магий
   * @param initiator Объект кастера
   * @param target Объект цели
   * @param game Объект игры
   */
  cast(initiator: Player, target: Player, game: Game): void {
    this.createContext(initiator, target, game);

    try {
      this.getCost(initiator);
      this.onBeforeRun();
      this.run(initiator, target, game); // вызов кастомного обработчика
      this.calculateExp();

      this.next();
    } catch (e) {
      if (this.isAffect) {
        throw e;
      }

      this.handleCastError(e);
    } finally {
      this.reset();
    }
  }

  override onBeforeRun(): void {
    const { initiator } = this.params;
    initiator.affects.withOnCastFail(() => this.checkChance(), this.context, this);
    super.onBeforeRun();
  }

  /**
   * Функция списывающая с кастера требуемое
   * кол-во единиц за использование магии
   * Если кастеру хватило mp/en продолжаем,если нет, то возвращаем false
   * @param initiator Объект кастера
   */
  getCost(initiator: Player): void {
    const costValue = +initiator.stats.val(this.costType) - this.cost;
    if (costValue >= 0) {
      initiator.stats.set(this.costType, costValue);
    } else {
      throw new CastError('NO_MANA');
    }
  }

  /**
   * Функция расчитывает эксп за использование магии
   */
  calculateExp(): void {
    this.status.exp = this.getEffectExp(this.status.effect || 0, this.baseExp);
  }

  getEffectExp(_effect: number, baseExp = 0) {
    return Math.round(baseExp * this.params.initiator.proc);
  }

  /**
   * Функция рассчитывает размер эффект от магии по стандартным дайсам
   * @return dice число эффекта
   */
  effectVal({ initiator, target, game } = this.params): number {
    const effect = this.getEffectVal({ initiator, target, game });
    const modifiedEffect = this.modifyEffect(effect, { initiator, target, game });
    this.status.effect = modifiedEffect;
    return modifiedEffect;
  }

  getEffectVal({ initiator } = this.params): number {
    const initiatorMagicLvl = initiator.getMagicLevel(this.name);
    return MiscService.dice(this.effect[initiatorMagicLvl - 1]) * initiator.proc;
  }

  modifyEffect(effect: number, { initiator } = this.params) {
    effect = this.applyCasterModifiers(effect, initiator);

    return floatNumber(effect);
  }

  applyCasterModifiers(effect: number, initiator: Player): number {
    return effect * (1 + 0.01 * initiator.stats.val('magic.attack'));
  }

  /**
   * Проверка прошла ли магия
   */
  checkChance(): undefined {
    const chance = this.getChance();
    const failStreak = this.params.initiator.failStreak.get(this.name);
    const success = MiscService.pseudoRandomChance(chance, failStreak);

    console.debug(
      `${this.name} check chance:: ${chance}, streak: ${failStreak}, success: ${success}`,
    );
    if (!success) {
      this.params.initiator.failStreak.add(this.name);
      throw new CastError('CHANCE_FAIL');
    }

    this.params.initiator.failStreak.delete(this.name);
  }

  /**
   * Возвращает шанс прохождения магии
   * @return result шанс прохождения
   */
  getChance(): number {
    const { initiator, target } = this.params;
    // FIXME временно fallback на 1 уровень для эффектов
    const initiatorMagicLvl = initiator.magics[this.name] ?? 1;
    const imc = initiator.modifiers.castChance; // мод шанс прохождения
    const castChance = initiator.getCastChance(this.name); // мод action'а
    const failChance = target.getFailChance(this.name);
    let chance = this.chance[initiatorMagicLvl - 1];
    if (typeof chance === 'string') {
      chance = MiscService.dice(chance);
    }
    let result = chance + imc;

    if (castChance) {
      // если модификатор шанса для этого скила есть,
      // то плюсуем его к шансу
      result += castChance;
    }

    if (failChance) {
      result -= failChance;
    }
    // тут нужно взять получившийся шанс и проверить ещё отношение mga цели
    // @todo magics cast chance
    if (this.magType === 'bad') {
      const attack = initiator.stats.val('magic.attack');
      const defence = target.stats.val('magic.defence');
      const ratio = attack / defence;

      result *= 1 - Math.exp(-1 * ratio);
    }
    console.debug(
      `${this.name} cast chance:: ${result * initiator.proc} (${result}), chance ${chance}, ratio (dmg): ${initiator.stats.val('magic.attack') / target.stats.val('magic.defence')} initiator:: ${initiator.nick}, target:: ${target.nick}, proc:: ${initiator.proc}`,
    );
    return result * initiator.proc;
  }

  toObject(): MagicSchema {
    return {
      name: this.name,
      displayName: this.displayName,
      description: this.desc,
      costType: this.costType as CostType,
      cost: this.cost,
      effect: this.effect,
      effectType: this.effectType,
      lvl: this.lvl,
      orderType: this.orderType,
    };
  }
}
