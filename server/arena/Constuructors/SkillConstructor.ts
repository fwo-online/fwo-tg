import type { BranchKey, OrderType } from '@fwo/shared';
import type { ActionKey } from '@/arena/ActionService';
import { BaseAction } from '@/arena/Constuructors/BaseAction';
import type { Profs } from '../../data';
import CastError from '../errors/CastError';
import type Game from '../GameService';
import MiscService from '../MiscService';
import type { Player } from '../PlayersService';
import type { ActionType, AOEType, CostType, CustomMessage } from './types';

interface SkillArgs {
  name: ActionKey;
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
  branch?: BranchKey;
  branches?: BranchKey[];
  weaponTypes?: string[];
}

/**
 * Основной конструктор класса скилов (войны/лучники)
 */
export interface Skill extends SkillArgs, CustomMessage {}

export abstract class Skill extends BaseAction {
  actionType: ActionType = 'skill';
  branch?: BranchKey;
  branches: BranchKey[] = [];
  weaponTypes?: string[];

  /**
   * Создание скила
   */
  constructor(params: SkillArgs) {
    super();

    Object.assign(this, params);
    this.branches = params.branches ?? (params.branch ? [params.branch] : []);
    this.branch = params.branch ?? this.branches[0];
    if (params.weaponTypes) {
      this.weaponTypes = params.weaponTypes;
    }
  }

  /**
   * Основная точка вхождения в выполнение скила
   * @param initiator инициатор
   * @param target цель
   * @param game Game объект игры
   */
  cast(initiator: Player, target: Player, game: Game): void {
    try {
      this.createContext(initiator, target, game);
      this.fitsCheck();
      this.getCost();
      this.checkChance();
      this.onBeforeRun();
      this.run(initiator, target, game);
      this.next();
    } catch (e) {
      this.handleCastError(e);
    } finally {
      this.reset();
    }
  }

  /**
   * Проверка условий применения скилла (наличие подходящего оружия)
   */
  fitsCheck(): void {
    const { initiator } = this.params;
    if (this.weaponTypes?.length && !initiator.weapon.isOfType(this.weaponTypes)) {
      throw new CastError('NO_WEAPON');
    }
  }

  checkWeapon(initiator: Player = this.params.initiator): boolean {
    if (!this.weaponTypes?.length) {
      return true;
    }
    return initiator.weapon.isOfType(this.weaponTypes);
  }

  /**
   * Получение эффекта скилла согласно его уровню у персонажа
   */
  getEffect(initiator: Player = this.params.initiator): number {
    const initiatorSkillLvl = initiator.getSkillLevel(this.name) || 1;
    return this.effect[initiatorSkillLvl - 1] ?? 0;
  }

  /**
   * Функция снимает требуемое кол-во en за использования скила
   */
  getCost(): void {
    const { initiator } = this.params;
    // достаем цену за использование согласно lvl скила у пользователя
    const skillCost = this.cost[(initiator.getSkillLevel(this.name) || 1) - 1];
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
  getChance(initiator: Player = this.params.initiator): number {
    const initiatorSkillLvl = initiator.getSkillLevel(this.name) || 1;
    return this.chance[initiatorSkillLvl - 1];
  }

  /**
   * Рассчитываем полученный exp
   */
  calculateExp(): void {
    this.status.exp = this.baseExp;
  }
}
