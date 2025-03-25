import arena from '@/arena';

import type { Item } from '@/models/item';

export class PlayerWeapon {
  item?: Item;

  constructor(item?: Item) {
    this.item = item;
  }

  hasWeapon() {
    return !!this.item;
  }

  isOfType(types: string[]) {
    if (!this.item) {
      return false;
    }

    const item = arena.items[this.item.code];

    return types.includes(item.type ?? '');
  }
}
