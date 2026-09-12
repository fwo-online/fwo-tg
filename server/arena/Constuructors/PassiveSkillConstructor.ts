import type { BranchKey } from '@fwo/shared';
import type { ActionKey } from '@/arena/ActionService';
import { BaseAction, type BaseActionParams } from '@/arena/Constuructors/BaseAction';
import type { ProfsLvl } from '@/data/profs';
import MiscService from '../MiscService';
import type { Player } from '../PlayersService';
import type { ActionType } from './types';

export interface PassiveSkillAttributes {
  name: ActionKey;
  chance: number[];
  effect: number[];
  bonusCost: number[];
  displayName: string;
  description: string;
  profList?: ProfsLvl;
  branch?: BranchKey;
  branches?: BranchKey[];
  weaponTypes?: string[];
  actionTypes?: ActionType[];
  skipChance?: boolean;
}

/**
 * Для пассивных навыков run вызывается один раз при инициализации игрока.
 * В run должно происходить накладывание эффектов или изменение базовых статов игрока
 */
export abstract class PassiveSkillConstructor extends BaseAction {
  name: ActionKey;
  displayName: string;
  description: string;
  chance: number[];
  effect: number[];
  bonusCost: number[];
  profList?: ProfsLvl;
  branch?: BranchKey;
  branches: BranchKey[] = [];
  actionType: ActionType = 'passive';
  weaponTypes?: string[];
  actionTypes?: ActionType[];
  skipChance: boolean;

  constructor(attributes: PassiveSkillAttributes) {
    super();

    this.name = attributes.name;
    this.chance = attributes.chance;
    this.effect = attributes.effect;
    this.bonusCost = attributes.bonusCost;
    this.displayName = attributes.displayName;
    this.description = attributes.description;
    this.profList = attributes.profList;
    this.branches = attributes.branches ?? (attributes.branch ? [attributes.branch] : []);
    this.branch = attributes.branch ?? this.branches[0];
    this.skipChance = attributes.skipChance ?? false;
    if (attributes.weaponTypes) {
      this.weaponTypes = attributes.weaponTypes;
    }
    if (attributes.actionTypes) {
      this.actionTypes = attributes.actionTypes;
    }
  }

  override cast(initiator: Player) {
    this.reset();
    // @ts-expect-error
    this.createContext(initiator);
    // @ts-expect-error
    this.run();
    this.reset();
  }

  isActive(initiator = this.context.initiator) {
    return Boolean(initiator.getPassiveSkillLevel(this.name));
  }

  checkChance(ctx = this.context) {
    return MiscService.rndm('1d100') <= this.getChance(ctx);
  }

  getChance({ initiator } = this.context) {
    const initiatorSkillLvl = initiator.getPassiveSkillLevel(this.name);
    return this.chance[initiatorSkillLvl - 1];
  }

  getEffect({ initiator } = this.context) {
    const initiatorSkillLvl = initiator.getPassiveSkillLevel(this.name);
    return this.effect[initiatorSkillLvl - 1];
  }

  checkWeapon(initiator = this.context.initiator): boolean {
    if (!this.weaponTypes?.length) {
      return true;
    }
    return initiator.weapon.isOfType(this.weaponTypes);
  }

  checkAction(action?: BaseAction): boolean {
    if (!action || !this.actionTypes?.length) {
      return true;
    }
    return this.actionTypes.includes(action.actionType);
  }

  /**
   * @description применяет контекст, проверяет actionType, weaponType, активно ли умение и шанс
   */
  canTrigger(ctx: BaseActionParams, action?: BaseAction): boolean {
    if (!this.checkAction(action)) {
      return false;
    }

    const { initiator, target, game } = ctx;
    this.createContext(initiator, target, game);

    if (!this.checkWeapon(initiator)) {
      return false;
    }

    if (!this.isActive(initiator)) {
      return false;
    }

    return this.checkChance(this.context);
  }
}
