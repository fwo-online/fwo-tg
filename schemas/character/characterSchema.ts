import type { CharacterAttributes } from './characterAttributesSchema';
import type { CharacterClass } from './characterClassSchema';
import type { Attributes } from '@/shared/attributes';
import type { Inventory } from '@/inventory/inventorySchema';

export type Character = {
  owner: string;
  name: string;
  gold: number;
  free: number;
  bonus: number;
  lvl: number;
  exp: number;
  inventory: Inventory[];
  magics: Record<string, number>;
  skills: Record<string, number>;
  attributes: CharacterAttributes;
  class: CharacterClass;
  dynamicAttributes: Attributes;
  game?: string;
};
