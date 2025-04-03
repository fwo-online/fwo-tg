import type { Item } from '@/models/item';

export class PlayerOffHand {
  item?: Item;

  constructor(item?: Item) {
    this.item = item;
  }

  hasOffHand() {
    return !!this.item;
  }

  isOfType(types: string[]) {
    if (!this.item) {
      return false;
    }

    return types.includes(this.item.type ?? '');
  }
}
