import arena from '@/arena';
import { filterByClass, filterByWear } from '@/arena/ItemService/utils';
import MiscService from '@/arena/MiscService';
import type { Char } from '@/models/character';
import { ItemModel } from '@/models/item';
import type { CharacterClass, ItemOutput } from '@fwo/shared';
import { matches } from 'es-toolkit/compat';

export class ItemService {
  static getItemsByClass(characterClass: CharacterClass, filter?: { wear: string; tier?: number }) {
    const visibleItems = Object.values(arena.items).filter(({ hidden }) => !hidden);
    const itemsByClass = visibleItems.filter(filterByClass(characterClass));

    if (filter?.wear) {
      return itemsByClass.filter(filterByWear(filter.wear));
    }

    return itemsByClass;
  }

  static getItemByCode(code: string) {
    return arena.items[code];
  }

  static async createItem(item: ItemOutput, createdBy: Char) {
    return ItemModel.create({
      ...item,
      createdBy,
    });
  }

  static createRandomItem(createdBy: Char, match: Partial<ItemOutput>) {
    const items = Object.values(arena.items)
      .filter(({ hidden }) => !hidden)
      .filter(matches(match));
    const random = MiscService.randInt(0, items.length);
    const item = items[random];

    return ItemModel.create({
      ...item,
      createdBy,
    });
  }
}
