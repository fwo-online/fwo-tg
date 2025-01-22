import arena from '@/arena';
import type { CharacterClass } from '@fwo/schemas';
import { filterByClass, filterByWear } from './utils';

export class ShopService {
  static getItemsByClass(characterClass: CharacterClass, filter?: { wear: string }) {
    const itemsByClass = Object.values(arena.items).filter(filterByClass(characterClass));

    if (filter?.wear) {
      return itemsByClass.filter(filterByWear(filter.wear));
    }

    return itemsByClass;
  }
}
