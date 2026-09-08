import type { BranchKey } from '@fwo/shared';
import type { ProfsLvl } from '@/data/profs';
import type { ActionKey } from '@/arena/ActionService';
import { BaseAction, type BaseActionContext } from '@/arena/Constuructors/BaseAction';
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

  isActive({ initiator } = this.params) {
    return Boolean(initiator.getPassiveSkillLevel(this.name));
  }

  checkChance({ initiator, target, game } = this.params) {
    return MiscService.rndm('1d100') <= this.getChance({ initiator, target, game });
  }

  getChance({ initiator } = this.params) {
    const initiatorSkillLvl = initiator.getPassiveSkillLevel(this.name);
    return this.chance[initiatorSkillLvl - 1];
  }

  getEffect({ initiator } = this.params) {
    const initiatorSkillLvl = initiator.getPassiveSkillLevel(this.name);
    return this.effect[initiatorSkillLvl - 1];
  }

  checkWeapon(initiator: Player = this.params.initiator): boolean {
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

  canTrigger(ctx: BaseActionContext, action?: BaseAction): boolean {
    if (!this.checkAction(action)) {
      return false;
    }

    const { initiator, target, game } = ctx;
    this.createContext(initiator, target, game);

    if (!this.checkWeapon(initiator)) {
      return false;
    }

    if (!this.isActive(this.context)) {
      return false;
    }

    return this.checkChance(this.context);
  }
}
