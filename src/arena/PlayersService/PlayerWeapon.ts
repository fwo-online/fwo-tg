import arena from '@/arena';
import type { InventoryDocument } from '@/models/inventory';

export class PlayerWeapon {
  protected inventory?: InventoryDocument;

  constructor(inventory?: InventoryDocument) {
    this.inventory = inventory;
  }

  get item() {
    if (!this.inventory) {
      return;
    }

    return arena.items[this.inventory.code];
  }

  hasWeapon() {
    return !!this.inventory;
  }

  isOfType(types: string[]) {
    if (!this.inventory) {
      return false;
    }

    const item = arena.items[this.inventory.code];

    return types.includes(item.wtype);
  }
}
