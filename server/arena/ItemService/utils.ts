import type { CharacterClass, ItemOutput } from '@fwo/shared';

export const filterByClass = (prof: CharacterClass) => (item: ItemOutput) =>
  item.class.includes(prof);
export const filterByWear = (wear: string) => (item: ItemOutput) => item.wear.includes(wear);
export const filterByTier = (tier: number) => (item: ItemOutput) => item.tier === tier;
