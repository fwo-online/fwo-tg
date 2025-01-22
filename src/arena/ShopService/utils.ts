import type { CharacterClass, Item } from '@fwo/schemas';

export const filterByClass = (prof: CharacterClass) => (item: Item) => item.class.includes(prof);
export const filterByWear = (wear: string) => (item: Item) => item.wear.includes(wear);
