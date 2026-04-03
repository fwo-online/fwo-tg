import type { ActionKey } from '@/arena/ActionService';
import { BaseAction } from '@/arena/Constuructors/BaseAction';
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
  actionType: ActionType = 'passive';

  constructor(attributes: PassiveSkillAttributes) {
    super();

    this.name = attributes.name;
    this.chance = attributes.chance;
    this.effect = attributes.effect;
    this.bonusCost = attributes.bonusCost;
    this.displayName = attributes.displayName;
    this.description = attributes.description;
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
}
