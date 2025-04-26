import type { CharacterPublic } from '@/character';
import type { Item } from '@/item/itemSchema';

export type ItemMarket = {
  id: string;
  seller: CharacterPublic;
  item: Item;
  price: number;
  createdAt: string;
};
