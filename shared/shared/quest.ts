import * as v from 'valibot';

export enum QuestType {
  Kills = 'kills',
  Damage = 'damage',
  Heal = 'heal',
}

export const questSchema = v.object({
  type: v.enum(QuestType),
  goal: v.number(),
  progress: v.optional(v.number(), 0),
});

export type Quest = v.InferOutput<typeof questSchema>;

// --- Daily Contracts ---

export enum ContractType {
  Damage = 'damage',
  Kills = 'kills',
  Heal = 'heal',
  UseAbility = 'useAbility',
  ForestLocations = 'forestLocations',
}

export enum ContractTier {
  EASY = 1,
  MEDIUM = 2,
  HARD = 3,
}

export const CONTRACTS_PER_DAY = 3;

export interface Contract {
  type: ContractType;
  tier: ContractTier;
  goal: number;
  progress: number;
  claimed: boolean;
  exp: number;
  gold: number;
  components: Record<string, number>;
}
