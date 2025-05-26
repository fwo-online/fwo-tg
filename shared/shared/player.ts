import type { CharacterClass } from '@/character/characterClassSchema';
import type { ClanPublic } from '@/clan';
import type { ItemInfo } from '@/item/itemInfoSchema';

export type Player = {
  id: string;
  name: string;
  class: CharacterClass;
  lvl: number;
  clan?: ClanPublic;
  alive: boolean;
  weapon?: ItemInfo;
  isBot?: boolean;
};

export type PlayerPerformance = {
  winner: boolean;
  alive: boolean;
  kills: number;
  damage: number;
  heal: number;
};
