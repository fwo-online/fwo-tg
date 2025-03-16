import { addItem, getItems, putOffItem, putOnItem, removeItem } from '@/api/inventory';
import arena from '@/arena';
import ValidationError from '@/arena/errors/ValidationError';
import type { Char } from '@/models/character';
import type { InventoryDocument } from '@/models/inventory';
import type { Inventory } from '@fwo/shared';
import type { Item } from '@fwo/shared';
import { attributesSchema, type Attributes } from '@fwo/shared';
import type { ItemSet } from '@fwo/shared';
import type { Modifiers } from '@fwo/shared';
import { assignWithSum } from '@/utils/assignWithSum';
import _ from 'lodash';
import { array, parse } from 'valibot';

export class InventoryService {
  harksFromItems: Attributes;

  constructor(
    private char: Char,
    public inventory: InventoryDocument[],
  ) {
    this.harksFromItems = this.updateHarkFromItems();
  }

  static getItemsByInventory(inventory: InventoryDocument[]): Item[] {
    return inventory.map(({ code }) => arena.items[code]);
  }

  static getItemsSetsByInventory(inventory: InventoryDocument[], full = true): ItemSet[] {
    const codes = new Set(inventory.map(({ code }) => code));
    return Object.values(arena.itemsSets).filter(({ items }) => {
      if (full) {
        return items.every((item) => codes.has(item));
      }

      return items.some((item) => codes.has(item));
    });
  }

  static getItemSetsModifiersByInventory(inventory: InventoryDocument[]): Modifiers[] {
    const itemsSets = InventoryService.getItemsSetsByInventory(inventory, false);
    const codes = new Set(inventory.map(({ code }) => code));
    const modifiers: Modifiers[] = [];

    for (const itemSet of itemsSets) {
      const itemsCount = itemSet.items.reduce((sum, item) => (codes.has(item) ? sum + 1 : sum), 0);

      for (const modifier of itemSet.modifiers) {
        if (modifier.itemsRequired <= itemsCount) {
          modifiers.push(modifier);
        }
      }
    }

    return modifiers;
  }

  get attributes() {
    return this.harksFromItems.attributes;
  }

  get modifiers() {
    return InventoryService.getItemSetsModifiersByInventory(this.inventory);
  }

  getItem(itemId: string) {
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
    const item = this.getItem(itemId);
    if (!item) {
      throw new ValidationError('Предмет не найден');
    }
    if (item.putOn) {
      throw new ValidationError('Нельзя продать надетый предмет');
    }

    await removeItem({ charId: this.char.id, itemId });
    await this.unEquipNonEquippableItems();

    return item;
  }

  async equipItem(itemId: string) {
    const charItem = this.getItem(itemId);
    if (!charItem) {
      throw new ValidationError('Предмет не найден');
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

  async unEquipItem(itemId: string) {
    await putOffItem({ charId: this.char.id, itemId });
    await this.unEquipNonEquippableItems();
  }

  async unEquipNonEquippableItems() {
    this.inventory = (await getItems(this.char.id)) ?? [];

    await this.updateHarkFromItems();

    const items = this.getEquippedItems().filter(
      ({ code }) => !this.hasRequiredAttributes(arena.items[code]),
    );
    if (items.length) {
      const putOffItems = items.map((i) => putOffItem({ charId: this.char.id, itemId: i.id }));
      await Promise.all(putOffItems);
      await this.unEquipNonEquippableItems();
    }
  }

  hasRequiredAttributes(item: Item) {
    return _.every(item.requiredAttributes, (value, attr) => value <= this.char.harks[attr]);
  }

  /**
   * Функция пересчитывает все характеристики,
   * которые были получены от надетых вещей в инвентаре персонажа
   */
  updateHarkFromItems() {
    const items = InventoryService.getItemsByInventory(this.getEquippedItems());
    const itemAttriributes = parse(array(attributesSchema), items);
    const harksFromItems = itemAttriributes.reduce(assignWithSum, parse(attributesSchema, {}));

    const itemsSets = InventoryService.getItemsSetsByInventory(this.getEquippedItems());
    const itemsSetsAttriributes = parse(array(attributesSchema), itemsSets);
    const harksFromItemsSets = itemsSetsAttriributes.reduce(assignWithSum, harksFromItems);

    this.harksFromItems = harksFromItemsSets;
    return harksFromItems;
  }

  toObject() {
    return this.inventory.map<Inventory>((item) => ({
      id: item.id,
      code: item.code,
      putOn: item.putOn,
      wear: item.wear,
      item: arena.items[item.code],
    }));
  }
}
