import type { CharacterClass, ItemOutput } from '@fwo/shared';
import { matches } from 'es-toolkit/compat';
import arena from '@/arena';
import { ActionService } from '@/arena/ActionService';
import { filterByClass, filterByWear } from '@/arena/ItemService/utils';
import MiscService from '@/arena/MiscService';
import type { Char } from '@/models/character';
import { ItemModel } from '@/models/item';

export class ItemService {
  static getItemsByClass(characterClass: CharacterClass, filter?: { wear: string; tier?: number }) {
    const visibleItems = Object.values(arena.items).filter(({ hidden }) => !hidden);
    const itemsByClass = visibleItems.filter(filterByClass(characterClass)).map((item) => {
      if (item.passive?.name && ActionService.isAction(item.passive.name)) {
        return {
          ...item,
          passive: {
            ...item.passive,
            name: arena.actions[item.passive.name].displayName,
          },
        };
      }
      return item;
    });

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

  static createRandomItem({
    createdBy,
    match,
    filter = () => true,
  }: {
    createdBy: Char;
    filter?: (item: ItemOutput) => boolean;
    match?: Partial<ItemOutput>;
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
