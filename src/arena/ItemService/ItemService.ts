import arena from '@/arena';
import type { CharacterClass } from '@fwo/shared';
import { filterByClass, filterByWear } from './utils';

export class ItemService {
  static getItemsByClass(characterClass: CharacterClass, filter?: { wear: string }) {
    const itemsByClass = Object.values(arena.items).filter(filterByClass(characterClass));

    if (filter?.wear) {
      return itemsByClass.filter(filterByWear(filter.wear));
    }

    return itemsByClass;
  }

  static getItemsByCodes(codes: string[]) {
    return codes.map((code) => arena.items[code]).filter(Boolean);
  }
}
