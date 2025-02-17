import type { CharacterClass } from '@/character';

export type Magic = {
  name: string;
  description: string;
  displayName: string;
  effect: string[];
  cost: number;
  costType: CostType;
  lvl: number;
  orderType: OrderType;
  effectType?: EffectType;
};

export type Skill = {
  name: string;
  displayName: string;
  description: string;
  classList: Partial<Record<CharacterClass, number>>;
  bonusCost: number[];
  orderType: OrderType;
  cost: number;
  costType: CostType;
};

export enum CostType {
  MP = 'mp',
  EN = 'en',
}

export enum OrderType {
  All = 'all',
  Any = 'any',
  Enemy = 'enemy',
  Self = 'self',
  Team = 'team',
  TeamExceptSelf = 'teamExceptSelf',
}

export enum EffectType {
  Acid = 'acid',
  Fire = 'fire',
  Lighting = 'lighting',
  Frost = 'frost',
  Physical = 'physical',
  Clear = 'clear',
}

export type ActionType =
  | 'magic'
  | 'dmg-magic'
  | 'dmg-magic-long'
  | 'aoe-dmg-magic'
  | 'magic-long'
  | 'skill'
  | 'phys'
  | 'heal-magic'
  | 'heal'
  | 'protect'
  | 'dodge'
  | 'passive'
  | 'regeneration';

export type ReservedFailReason =
  | 'NO_INITIATOR'
  | 'NO_TARGET'
  | 'NO_MANA'
  | 'NO_ENERGY'
  | 'CHANCE_FAIL'
  | 'GOD_FAIL'
  | 'HEAL_FAIL'
  | 'SKILL_FAIL'
  | 'PHYS_FAIL'
  | 'NO_WEAPON';
