import type { ProfListLvl } from '../../data/profs';
import type Game from '../GameService';
import MiscService from '../MiscService';
import type Player from '../PlayerService';
import type {
  CostType, OrderType, AOEType, Breaks, BreaksMessage, CustomMessage, BaseNext,
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
  profList: ProfListLvl;
  bonusCost: number[];
}

/**
 * Основной конструктор класса скилов (войны/лучники)
 */
export interface Skill extends SkillArgs, CustomMessage {
}

export abstract class Skill {
  params!: {
    initiator: Player;
    target: Player;
    game: Game;
  };
  /**
   * Создание скила
   */
  constructor(params: SkillArgs) {
    Object.assign(this, params);
  }

  /**
   * Пустая функция для потомка
   */
  abstract run(): void

  /**
   * Основная точка вхождения в выполнение скила
   * @param initiator инициатор
   * @param target цель
   * @param game Game обьект игры
   */
  cast(initiator: Player, target: Player, game: Game): void {
    this.params = {
      initiator, target, game,
    };
    try {
      this.getCost();
      this.checkChance();
      this.run();
      this.next();
      this.getExp(initiator);
    } catch (failMsg) {
      game.battleLog.log(failMsg);
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
      throw this.breaks('NO_ENERGY');
    }
  }

  /**
   * Проверяем шанс прохождения скилла
   */
  checkChance(): void {
    if (MiscService.rndm('1d100') > this.getChance()) {
      // скил сфейлился
      throw this.breaks('SKILL_FAIL');
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
   * Успешное прохождение скила и отправка записи в BattleLog
   */
  next(): void {
    const args: SkillNext = {
      exp: this.baseExp,
      action: this.displayName,
      actionType: 'skill',
      target: this.params.target.nick,
      initiator: this.params.initiator.nick,
      msg: this.customMessage?.bind(this),
    };
    this.params.game.battleLog.success(args);
  }

  /**
   * Расчитываем полученный exp
   */
  getExp(initiator: Player): void {
    initiator.stats.mode('up', 'exp', this.baseExp);
  }

  /**
   * Обработка провала магии
   */
  breaks(e: BreaksMessage): Breaks {
    return {
      action: this.displayName,
      initiator: this.params.initiator.nick,
      target: this.params.target.nick,
      actionType: 'skill',
      message: e,
    };
  }
}
