import {
  type CharacterAttributeKey,
  type CharacterAttributes,
  MonsterType,
} from '@fwo/shared';
import config from '@/arena/config';

// ─── Player reference curve ──────────────────────────────────────
// Base: ~30 harks at creation (varies by class). +10 free per level.
// So a typical player at lvl N has roughly 30 + 10*lvl harks.

export const PLAYER_BASE_HARKS = 30;

/** Approximate total hark budget for an average player of the given level. */
export const playerHarkBudget = (lvl: number): number =>
  PLAYER_BASE_HARKS + config.freePerLvl * lvl;

// ─── Ability gating ──────────────────────────────────────────────
type AttributeWeights = Record<CharacterAttributeKey, number>;

export interface AbilityGating {
  magics?: Record<string, number>;
  skills?: Record<string, number>;
  passiveSkills?: Record<string, number>;
}

/**
 * Filter an ability table to only entries unlocked at or below the given level.
 * Returns records suitable for passing to MonsterService.create().
 */
export const pickAbilities = (
  gating: AbilityGating,
  lvl: number,
): {
  magics: Record<string, number>;
  skills: Record<string, number>;
  passiveSkills: Record<string, number>;
} => {
  const pick = (entries: Record<string, number> = {}) =>
    Object.fromEntries(
      Object.entries(entries)
        .filter(([, minLevel]) => minLevel <= lvl)
        .map(([ability]) => [ability, 1]),
    );

  return {
    magics: pick(gating.magics),
    skills: pick(gating.skills),
    passiveSkills: pick(gating.passiveSkills),
  };
};

// ─── Monster archetype balance ───────────────────────────────────

export interface MonsterBalanceConfig {
  /** Multiplier on playerHarkBudget for this monster archetype. */
  budgetMultiplier: number;
  /** Weights for distributing the hark budget. Need not sum to 1 — normalized internally. */
  weights: AttributeWeights;
  /** Ability gating by level. */
  abilities: AbilityGating;
}

const distributeBudget = (budget: number, weights: CharacterAttributes): CharacterAttributes => {
  const weightSum = Object.values(weights).reduce((a, b) => a + b, 0);

  return Object.fromEntries(
    Object.entries(weights).map(([attribute, weight]) => [
      attribute,
      Math.max(1, Math.round(budget * (weight / weightSum))),
    ]),
  ) as CharacterAttributes;
};

export const buildMonsterHarks = (
  lvl: number,
  balance: MonsterBalanceConfig,
  budgetScale = 1,
): CharacterAttributes => {
  const budget = playerHarkBudget(lvl) * balance.budgetMultiplier * budgetScale;

  return distributeBudget(budget, balance.weights);
};

/** One-shot: resolve harks + abilities for a monster archetype at a given level. */
export const resolveMonsterConfig = (
  type: MonsterType,
  lvl: number,
  budgetScale = 1,
) => {
  const balance = MONSTER_BALANCE[type];
  return {
    harks: buildMonsterHarks(lvl, balance, budgetScale),
    abilities: pickAbilities(balance.abilities, lvl),
  };
};

// ─── Archetype definitions ───────────────────────────────────────
//
// Target player win rates (simulated):
//   Edge: ~85%  Wilds: ~70%  Deep: ~55%
// These are the knobs — tune budgetMultiplier to shift win rates.

export const MONSTER_BALANCE: Record<MonsterType, MonsterBalanceConfig> = {
  [MonsterType.Wolf]: {
    budgetMultiplier: 0.75,
    weights: { str: 3, dex: 1, int: 1, wis: 1.5, con: 5 },
    abilities: {
      magics: { bleeding: 1 },
      skills: { terrifyingHowl: 4 },
      passiveSkills: { nightcall: 1, lacerate: 6 },
    },
  },
  [MonsterType.Spider]: {
    budgetMultiplier: 0.8,
    weights: { str: 1.5, dex: 3, int: 1, wis: 1, con: 1.5 },
    abilities: {
      magics: { paralysis: 2 },
    },
  },
  [MonsterType.Ghost]: {
    budgetMultiplier: 0.85,
    weights: { str: 1, dex: 2, int: 3, wis: 2, con: 2 },
    abilities: {
      magics: { madness: 3 },
    },
  },
  [MonsterType.Spirit]: {
    budgetMultiplier: 0.85,
    weights: { str: 1, dex: 1, int: 3, wis: 2, con: 1.5 },
    abilities: {
      magics: { frostTouch: 3 },
    },
  },
  [MonsterType.Elemental]: {
    budgetMultiplier: 0.9,
    weights: { str: 2, dex: 1, int: 4, wis: 3, con: 3 },
    abilities: {
      magics: { chainLightning: 5 },
    },
  },
  [MonsterType.Skeleton]: {
    budgetMultiplier: 0.4,
    weights: { str: 3, dex: 1, int: 3, wis: 2, con: 1 },
    abilities: {},
  },
  [MonsterType.Alpha]: {
    budgetMultiplier: 1.6,
    weights: { str: 3, dex: 1, int: 1, wis: 2, con: 13 },
    abilities: {
      magics: { bleeding: 1 },
      skills: { beastCall: 1, terrifyingHowl: 1 },
      passiveSkills: { lacerate: 1, nightcall: 1 },
    },
  },
};
