import type GameService from '../GameService';
import MiscService from '../MiscService';
import type { Player } from '../PlayersService';
import { AffectableAction } from './AffectableAction';
import type { ActionType } from './types';

export interface PassiveSkillAttributes {
  name: string;
  chance: number[];
  effect: number[];
  bonusCost: number[];
  displayName: string;
}

export abstract class PassiveSkillConstructor extends AffectableAction {
  name: string;
  displayName: string;
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
  }

  cast(initiator: Player, target: Player, game: GameService) {
    this.createContext(initiator, target, game);
    this.run(initiator, target, game);
    this.reset();
  }

  isActive() {
    const { initiator } = this.params;
    return Boolean(initiator.getSkillLevel(this.name));
  }

  checkChance({ initiator, target, game } = this.params) {
    return MiscService.rndm('1d100') <= this.getChance({ initiator, target, game });
  }

  getChance({ initiator } = this.params) {
    const initiatorSkillLvl = initiator.getSkillLevel(this.name);
    return this.chance[initiatorSkillLvl - 1];
  }

  getEffect() {
    const { initiator } = this.params;
    const initiatorSkillLvl = initiator.getSkillLevel(this.name);
    return this.effect[initiatorSkillLvl - 1];
  }
}
