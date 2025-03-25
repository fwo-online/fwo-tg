import arena from '@/arena';
import type { CharacterClass, ItemOutput } from '@fwo/shared';
import { ItemModel } from '@/models/item';
import type { Char } from '@/models/character';
import { filterByClass, filterByWear } from '@/arena/ItemService/utils';

export class ItemService {
  static getItemsByClass(characterClass: CharacterClass, filter?: { wear: string }) {
    const itemsByClass = Object.values(arena.items).filter(filterByClass(characterClass));

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
}
