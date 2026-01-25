import type { ClanPublic } from '@/clan';
import type { Item, ItemComponent } from '@/item';
import type { NotificationSettings } from '@/notifications/notificationSettingsSchema';
import type { Attributes } from '@/shared/attributes';
import type { CharacterAttributes } from './characterAttributesSchema';
import type { CharacterClass } from './characterClassSchema';

export type Character = {
  id: string;
  owner: string;
  name: string;
  gold: number;
  free: number;
  bonus: number;
  lvl: number;
  exp: number;
  nextLvlExp: number;
  psr: number;
  statistics: {
    games: number;
    kills: number;
    death: number;
    runs: number;
    wins: number;
  };
  magics: Record<string, number>;
  skills: Record<string, number>;
  passiveSkills: Record<string, number>;
  attributes: CharacterAttributes;
  class: CharacterClass;
  dynamicAttributes: Attributes;
  game?: string;
  tower?: string;
  clan?: ClanPublic;
  items: Item[];
  equipment: string[];
  components: Record<ItemComponent, number>;
  notificationSettings?: NotificationSettings;
};
