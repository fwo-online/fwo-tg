import type { Profs } from '../../data';
import CastError from '../errors/CastError';
import type Game from '../GameService';
import MiscService from '../MiscService';
import type { Player } from '../PlayersService';
import { AffectableAction } from './AffectableAction';
import type {
  CostType, OrderType, AOEType, CustomMessage, BaseNext, ActionType,
} from './types';

export type SkillNext = BaseNext & {
  actionType: 'skill';
}

interface SkillArgs {
  name: string;
  displayName: string;
  desc: string;
  cost: number[];
  proc: number;
  baseExp: number;
  costType: CostType;
  orderType: OrderType;
  aoeType: AOEType;
  chance: number[];
  effect: number[];
  profList: Profs.ProfsLvl;
  bonusCost: number[];
}

/**
 * Основной конструктор класса скилов (войны/лучники)
 */
export interface Skill extends SkillArgs, CustomMessage {
}

export abstract class Skill extends AffectableAction {
  actionType: ActionType = 'skill';
  /**
   * Создание скила
   */
  constructor(params: SkillArgs) {
    super();

    Object.assign(this, params);
  }

  /**
   * Основная точка вхождения в выполнение скила
   * @param initiator инициатор
   * @param target цель
   * @param game Game объект игры
   */
  cast(initiator: Player, target: Player, game: Game): void {
    this.params = {
      initiator, target, game,
    };
    try {
      this.getCost();
      this.checkPreAffects();
      this.checkChance();
      this.run(initiator, target, game);
      this.next();
    } catch (e) {
      this.handleCastError(e);
    }
  }

  /**
   * Функция снимает требуемое кол-во en за использования скила
   */
  getCost(): void {
    const { initiator } = this.params;
    // достаем цену за использование согласно lvl скила у пользователя
    const skillCost = this.cost[initiator.skills[this.name] - 1];
    const remainingEnergy = initiator.stats.val(this.costType) - skillCost;
    if (remainingEnergy >= 0) {
      initiator.stats.set(this.costType, remainingEnergy);
    } else {
      throw new CastError('NO_ENERGY');
    }
  }

  /**
   * Проверяем шанс прохождения скилла
   */
  checkChance(): void {
    if (MiscService.rndm('1d100') > this.getChance()) {
      // скил сфейлился
      throw new CastError('SKILL_FAIL');
    }
  }

  /**
   * Собираем параметр шанса
   * @return шанс прохождения
   */
  getChance(): number {
    const { initiator } = this.params;
    const initiatorSkillLvl = initiator.skills[this.name];
    return this.chance[initiatorSkillLvl - 1];
  }

  /**
   * Рассчитываем полученный exp
   */
  getExp(initiator: Player): void {
    this.status.exp = this.baseExp;
    initiator.stats.up('exp', this.status.exp);
  }

  getSuccessResult({ initiator, target } = this.params): SkillNext {
    const result: SkillNext = {
      exp: this.status.exp,
      action: this.displayName,
      actionType: 'skill',
      target: target.nick,
      initiator: initiator.nick,
      msg: this.customMessage?.bind(this),
    };

    this.reset();

    return result;
  }

  reset() {
    this.status.exp = 0;
  }

  next({ initiator, target, game } = this.params): void {
    const result = this.getSuccessResult({ initiator, target, game });

    game.recordOrderResult(result);
  }
}
