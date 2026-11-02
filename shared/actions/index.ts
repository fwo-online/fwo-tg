import type { CharacterClass } from '@/character';
import { type BranchKey, getAbilityBranches, hasSelectedBranchForProf } from './branches';

export const MAX_MAGIC_LVL = 3;

export interface BaseAbility {
  name: string;
  displayName: string;
  description: string;
  bonusCost: number[];
  classList?: Partial<Record<CharacterClass, number>>;
  branch?: BranchKey;
  branches?: BranchKey[];
}

export type Magic = BaseAbility & {
  effect: string[];
  cost: number;
  costType: CostType;
  lvl: number;
  orderType: OrderType;
  effectType?: EffectType;
};

export type Skill = BaseAbility & {
  classList: Partial<Record<CharacterClass, number>>;
  orderType: OrderType;
  cost: number;
  costType: CostType;
  chance: number[];
  effect: number[];
};

export type PassiveSkill = BaseAbility & {
  chance: number[];
  effect: number[];
};

export type Ability =
  | ({ kind: 'magic' } & Magic)
  | ({ kind: 'skill' } & Skill)
  | ({ kind: 'passive' } & PassiveSkill);

export type AbilityState = {
  rank: number;
  maxRank: number;
  nextCost?: number;
  requiredLevel: number;
  canLearn: boolean;
  lockReason?: string;
};

export type TreeAbility = Ability & AbilityState;

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
  Physical = 'physical',
  Fire = 'fire',
  Lightning = 'lightning',
  Frost = 'frost',
  Acid = 'acid',
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
  | 'regeneration'
  | 'miss';

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

export function getRequiredMagicCharLvl(magicLvl: number) {
  return magicLvl * 2 - 1;
}

export function canLearnMagic(characterLvl: number, magicLvl: number) {
  return characterLvl >= getRequiredMagicCharLvl(magicLvl);
}

export function getLearnMagicCost(magicLvl: number) {
  return magicLvl ** 2 * 10;
}

export interface CharacterAbilitySnapshot {
  class: CharacterClass | string;
  lvl: number;
  bonus: number;
  branches: readonly BranchKey[];
  magics?: Record<string, number>;
  skills?: Record<string, number>;
  passiveSkills?: Record<string, number>;
}

export function getAbilityRank(
  char: Pick<CharacterAbilitySnapshot, 'magics' | 'skills' | 'passiveSkills'>,
  ability: Pick<Ability, 'kind' | 'name'>,
): number {
  if (ability.kind === 'magic') return char.magics?.[ability.name] ?? 0;
  if (ability.kind === 'skill') return char.skills?.[ability.name] ?? 0;
  return char.passiveSkills?.[ability.name] ?? 0;
}

export function getAbilityState(
  char: CharacterAbilitySnapshot,
  ability: Ability,
  groupProf: CharacterClass | string = char.class,
): AbilityState {
  const targetProf = groupProf as CharacterClass;
  const rank = getAbilityRank(char, ability);
  const maxRank = ability.bonusCost.length;
  const nextCost = ability.bonusCost[rank];
  const requiredLevel =
    ability.classList?.[targetProf] ??
    (ability.kind === 'magic' ? getRequiredMagicCharLvl(ability.lvl) : 0);
  const branches = getAbilityBranches(ability);

  let lockReason: string | undefined;
  if (targetProf !== char.class) {
    lockReason = 'Недоступно для вашего класса';
  } else if (ability.classList && !(targetProf in ability.classList)) {
    lockReason =
      ability.kind === 'magic'
        ? 'Заклинание недоступно для этого класса'
        : 'Умение недоступно для вашего класса';
  } else if (branches.length > 0 && !hasSelectedBranchForProf(char.class, char.branches, ability)) {
    lockReason = 'Выберите ветку специализации';
  } else if (char.lvl < requiredLevel) {
    lockReason = 'Недостаточный уровень персонажа';
  } else if (rank >= maxRank) {
    lockReason = 'Максимальный уровень';
  } else if (nextCost === undefined || char.bonus < nextCost) {
    lockReason = 'Не хватает бонусов';
  }

  return {
    rank,
    maxRank,
    nextCost,
    requiredLevel,
    canLearn: !lockReason,
    lockReason,
  };
}

export * from './branches';
