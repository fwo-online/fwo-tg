import type { CharacterClass } from '@/character';

export type Magic = {
  effect: string[];
  name: string;
  desc: string;
  displayName: string;
  cost: number;
  lvl: number;
};

export type Skill = {
  name: string;
  displayName: string;
  description: string;
  classList: Partial<Record<CharacterClass, number>>;
  bonusCost: number[];
};
