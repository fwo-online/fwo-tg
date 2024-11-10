import _ from 'lodash';
import { getItems, addItem, removeItem, putOnItem, putOffItem } from '@/api/inventory';
import arena from '@/arena';
import ValidationError from '@/arena/errors/ValidationError';
import type { Char } from '@/models/character';
import type { InventoryDocument } from '@/models/inventory';
import type { Inventory } from '@/schemas/inventory';
import { assignWithSum } from '@/utils/assignWithSum';
import { itemAttributesSchema, type ItemAttributes } from '@/schemas/item/itemAttributesSchema';
import type { Item } from '@/schemas/item';

export class InventoryService {
  harksFromItems: ItemAttributes;

  constructor(
    private char: Char,
    public inventory: InventoryDocument[],
  ) {
    this.harksFromItems = this.updateHarkFromItems();
  }

  static getItemsByInventory(inventory: InventoryDocument[]): Item[] {
    return inventory.map(({ code }) => arena.items[code]);
  }

  get attributes() {
    return this.harksFromItems.attributes;
  }

  getItem(itemId) {
    return this.inventory.find((item) => item._id.equals(itemId));
  }

  getEquippedItems() {
    return this.inventory.filter((item) => item.putOn);
  }

  getEquippedWeapon() {
    return this.getEquippedItems().find((item) => item.wear.includes('rightHand') && item.putOn);
  }

  canEquip(itemToEquip: Item) {
    return !this.getEquippedItems().some(
      (item) => item.wear.includes(itemToEquip.wear) || itemToEquip.wear.includes(item.wear),
    );
  }

  async addItem(itemCode: string) {
    const item = await addItem({ charId: this.char.id, itemCode });
    this.inventory.push(item);
  }

  async removeItem(itemId: string) {
    await removeItem({ charId: this.char.id, itemId });
    await this.unEquipNonEquippableItems();
  }

  async equipItem(itemId: string) {
    const charItem = this.getItem(itemId);
    if (!charItem) {
      throw new ValidationError('Этого предмета больше не существует');
    }

    const item = arena.items[charItem.code];

    if (!this.hasRequiredAttributes(item)) {
      throw new ValidationError('Недостаточно характеристик');
    }

    if (!this.canEquip(item)) {
      throw new ValidationError('На этом месте уже надет другой предмет');
    }

    await putOnItem({ charId: this.char.id, itemId });
    const inventory = await getItems(this.char.id);
    this.inventory = inventory ?? [];
    await this.updateHarkFromItems();
  }

  async unEquipItem(itemId) {
    await putOffItem({ charId: this.char.id, itemId });
    await this.unEquipNonEquippableItems();
  }

  async unEquipNonEquippableItems() {
    this.inventory = (await getItems(this.char.id)) ?? [];

    await this.updateHarkFromItems();

    const items = this.getEquippedItems().filter(
      (i) => !this.hasRequiredAttributes(arena.items[i.code]),
    );
    if (items.length) {
      const putOffItems = items.map((i) => putOffItem({ charId: this.char.id, itemId: i.id }));
      await Promise.all(putOffItems);
      await this.unEquipNonEquippableItems();
    }
  }

  hasRequiredAttributes(item: Item) {
    return _.some(item.requiredAttributes, (value, attr) => value > this.char.harks[attr]);
  }

  /**
   * Функция пересчитывает все характеристики,
   * которые были получены от надетых вещей в инвентаре персонажа
   */
  updateHarkFromItems() {
    const items = InventoryService.getItemsByInventory(this.getEquippedItems());
    const itemAttriributes = itemAttributesSchema.array().parse(items);
    const harksFromItems = itemAttriributes.reduce(assignWithSum, itemAttributesSchema.parse({}));

    this.harksFromItems = harksFromItems;
    return harksFromItems;
  }

  toObject() {
    return this.inventory.map<Inventory>((item) => ({
      code: item.code,
      putOn: item.putOn,
      wear: item.wear,
    }));
  }
}
