import Game from '../GameService';
import arena from '../index';
import MiscService from '../MiscService';
import Player from '../PlayerService';
import { CostType, OrderType, AOEType, Breaks } from './types';

type SkillName = keyof typeof arena['skills'];

interface SkillArgs {
  name: SkillName;
  displayName: string;
  desc: string;
  cost: number[];
  proc: number;
  baseExp: number;
  costType: CostType;
  lvl: number;
  orderType: OrderType;
  aoeType: AOEType;
  chance: number[];
  effect: number[];
  msg: (nick: string, exp: number) => string;
  profList: string[];
  bonusCost: number[];
}

/**
 * Основной конструктор класса скилов (войны/лучники)
 */
export default abstract class Skill implements SkillArgs {
  name: SkillName;
  displayName: string;
  desc: string;
  cost: number[];
  proc: number;
  baseExp: number;
  costType: CostType;
  lvl: number;
  orderType: OrderType;
  aoeType: AOEType;
  chance: number[];
  effect: number[];
  msg: (nick: string, exp: number) => string;
  profList: string[];
  bonusCost: number[];
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
      initiator.stats.mode('set', this.costType, +remainingEnergy);
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
    this.params.game.battleLog.success({
      exp: this.baseExp,
      action: this.displayName,
      actionType: 'skill',
      target: this.params.target.nick,
      initiator: this.params.initiator.nick,
      msg: this.msg,
    });
  }

  /**
   * Пустая функция для потомка
   */
  abstract run(): void

  /**
   * Расчитываем полученный exp
   */
  getExp(initiator: Player): void {
    initiator.stats.mode('up', 'exp', this.baseExp);
  }

  /**
   * Обработка провала магии
   */
  breaks(e: string): Breaks {
    return {
      action: this.displayName,
      initiator: this.params.initiator.nick,
      target: this.params.target.nick,
      actionType: 'skill',
      message: e,
    };
  }
}