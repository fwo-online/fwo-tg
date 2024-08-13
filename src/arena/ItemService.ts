import arena from '@/arena';
import type { Item } from '@/models/item';
import type { ItemSet } from '@/models/item-set';

/**
 * Items Service
 *
 * @description Набор функций для работы с вещами.
 * @module Service/Item
 */
export default class ItemService {
  /**
   * Получить наборы предметов, которые можно собрать из предоставленных предметов.
   * @param items Массив предметов
   * @returns Массив наборов предметов
   */
  static getItemSets(items: Item[]): ItemSet[] {
    const itemSets = Object.values(arena.itemSets);
    const itemCodes = new Set(items.map(({ code }) => code));

    const validSets = itemSets.filter((itemSet) => {
      return itemSet.items.every((code) => itemCodes.has(code));
    });

    const setCodes = new Set(validSets.map(({ code }) => code));

    return validSets.filter((set) => {
      if (set.full_set) {
        // Исключаем набор, если полный набор уже найден
        return !setCodes.has(set.full_set);
      }
      return true;
    });
  }
}
