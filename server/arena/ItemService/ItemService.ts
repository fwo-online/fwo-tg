import type { CharacterClass, Item, ItemOutput, ItemWithID } from '@fwo/shared';
import { matches } from 'es-toolkit/compat';
import arena from '@/arena';
import { filterByClass, filterByWear } from '@/arena/ItemService/utils';
import MiscService from '@/arena/MiscService';
import type { Char } from '@/models/character';
import { ItemModel } from '@/models/item';

export class ItemService {
  static getItemsByClass(
    characterClass: CharacterClass,
    filter?: { wear: string; tier?: number },
  ): Item[] {
    const visibleItems = Object.values(arena.items).filter(({ hidden }) => !hidden);
    const itemsByClass = visibleItems.filter(filterByClass(characterClass));

    if (filter?.wear) {
      return itemsByClass.filter(filterByWear(filter.wear));
    }

    return itemsByClass;
  }

  static getItemByCode(code: string): Item {
    return arena.items[code];
  }

  static async createItem(item: ItemOutput, createdBy: Char): Promise<ItemWithID> {
    return ItemModel.create({
      ...item,
      createdBy,
    });
  }

  static createRandomItem({
    createdBy,
    match,
    filter = () => true,
  }: {
    createdBy: Char;
    filter?: (item: Item) => boolean;
    match?: Partial<Item>;
  }) {
    const items = Object.values(arena.items)
      .filter(({ hidden }) => !hidden)
      .filter(matches(match))
      .filter(filter);
    const random = MiscService.randInt(0, items.length);
    const item = items[random];

    return ItemModel.create({
      ...item,
      createdBy,
    });
  }
}
