import type { Item, ItemComponent } from '@/item';
import type { CharacterAttributes } from './characterAttributesSchema';
import type { CharacterClass } from './characterClassSchema';
import type { Attributes } from '@/shared/attributes';

export type Character = {
  id: string;
  owner: string;
  name: string;
  gold: number;
  free: number;
  bonus: number;
  lvl: number;
  exp: number;
  magics: Record<string, number>;
  skills: Record<string, number>;
  passiveSkills: Record<string, number>;
  attributes: CharacterAttributes;
  class: CharacterClass;
  dynamicAttributes: Attributes;
  game?: string;
  clan?: string;
  items: Item[];
  equipment: string[];
  components: Record<ItemComponent, number>;
};
