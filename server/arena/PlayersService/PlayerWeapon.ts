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

    return types.includes(this.item.type ?? '');
  }
}
