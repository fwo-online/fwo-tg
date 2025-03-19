import type { CharacterClass } from '@/character/characterClassSchema';
import type { ItemInfo } from '@/item/itemInfoSchema';

export type Player = {
  id: string;
  name: string;
  class: CharacterClass;
  lvl: number;
  clan?: string;
  alive: boolean;
  weapon?: ItemInfo;
};
