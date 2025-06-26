import type { ItemSet, Modifiers } from '@fwo/shared';
import { type Attributes, attributesSchema, ItemWear } from '@fwo/shared';
import { every } from 'es-toolkit/compat';
import { array, parse } from 'valibot';
import arena from '@/arena';
import type { CharacterService } from '@/arena/CharacterService/CharacterService';
import ValidationError from '@/arena/errors/ValidationError';
import type { Char } from '@/models/character';
import type { Item } from '@/models/item';
import { assignWithSum } from '@/utils/assignWithSum';

export class CharacterInventory {
  harksFromItems: Attributes;
  charObj: Char;

  constructor(private character: CharacterService) {
    this.character = character;
    this.charObj = character.charObj;

    this.harksFromItems = this.updateHarkFromItems();
  }

  get items() {
    return this.charObj.items;
  }

  get equipment() {
    return this.charObj.equipment;
  }

  static getItemsSetsByInventory(inventory: Item[], full = true): ItemSet[] {
    const codes = new Set(inventory.map(({ code }) => code));
    return Object.values(arena.itemsSets).filter(({ items }) => {
      if (full) {
        return items.every((item) => codes.has(item));
      }

      return items.some((item) => codes.has(item));
    });
  }

  static getItemSetsModifiersByInventory(inventory: Item[]): Modifiers[] {
    const itemsSets = CharacterInventory.getItemsSetsByInventory(inventory, false);
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
    return structuredClone(this.harksFromItems.attributes);
  }

  get modifiers() {
    return CharacterInventory.getItemSetsModifiersByInventory(this.items);
  }

  getItem(itemId: string) {
    return this.charObj.items.find((item) => item._id.equals(itemId));
  }

  getEquippedWeapon() {
    const item = this.equipment.get(ItemWear.MainHand) || this.equipment.get(ItemWear.TwoHands);
    if (item) {
      return this.getItem(item._id.toString());
    }
  }

  getEquippedOffHand() {
    const item = this.equipment.get(ItemWear.OffHand);
    if (item) {
      return this.getItem(item._id.toString());
    }
  }

  canEquip(itemToEquip: Item) {
    if (this.equipment.has(itemToEquip.wear)) {
      return false;
    }

    if (itemToEquip.wear === ItemWear.MainHand && this.getEquippedWeapon()) {
      return false;
    }

    if (itemToEquip.wear === ItemWear.TwoHands && this.getEquippedWeapon()) {
      return false;
    }

    if (itemToEquip.wear === ItemWear.TwoHands && this.equipment.has(ItemWear.OffHand)) {
      return false;
    }

    if (itemToEquip.wear === ItemWear.OffHand && this.equipment.has(ItemWear.TwoHands)) {
      return false;
    }

    if (!itemToEquip.class.includes(this.character.class)) {
      return false;
    }

    return true;
  }

  isEquipped(item: Item) {
    return this.equipment.values().some((equippedItem) => equippedItem._id.equals(item.id));
  }

  async addItem(item: Item) {
    this.charObj.items.push(item);

    await this.character.saveToDb();
  }

  async removeItem(itemId: string) {
    const item = this.getItem(itemId);
    if (!item) {
      throw new ValidationError('Предмет не найден');
    }
    if (this.isEquipped(item)) {
      throw new ValidationError('Нельзя продать надетый предмет');
    }

    this.charObj.items = this.charObj.items.filter(({ id }) => item.id !== id);
    this.unEquipNonEquippableItems();

    await this.character.saveToDb();

    return item;
  }

  public async equipItem(itemId: string) {
    const item = this.getItem(itemId);
    if (!item) {
      throw new ValidationError('Предмет не найден');
    }

    if (!this.hasRequiredAttributes(item)) {
      throw new ValidationError('Недостаточно характеристик');
    }

    if (!this.canEquip(item)) {
      throw new ValidationError('На этом месте уже надет другой предмет');
    }

    this.equipment.set(item.wear, item);
    this.updateHarkFromItems();

    await this.character.saveToDb();
  }

  async unEquipItem(itemId: string) {
    const item = this.getItem(itemId);
    if (!item) {
      throw new ValidationError('Предмет не найден');
    }

    this.equipment.delete(item.wear);
    await this.unEquipNonEquippableItems();

    await this.character.saveToDb();
  }

  async unEquipNonEquippableItems() {
    this.updateHarkFromItems();

    for (const wear in this.equipment) {
      const equippedItem = this.equipment.get(wear as ItemWear);
      if (!equippedItem) {
        continue;
      }

      const item = this.getItem(equippedItem.id);
      if (item && (!this.hasRequiredAttributes(item) || !this.canEquip(item))) {
        return this.unEquipItem(item.id);
      }
    }
  }

  hasRequiredAttributes(item: Item) {
    return every(
      item.requiredAttributes,
      (value, attr) => value <= this.character.attributes.attributes[attr],
    );
  }

  /**
   * Функция пересчитывает все характеристики,
   * которые были получены от надетых вещей в инвентаре персонажа
   */
  updateHarkFromItems() {
    const items = Array.from(this.equipment.values())
      .map((item) => this.getItem(item._id.toString()))
      .filter((item) => !!item);
    const itemAttriributes = parse(array(attributesSchema), items);
    const harksFromItems = itemAttriributes.reduce(assignWithSum, parse(attributesSchema, {}));

    const itemsSets = CharacterInventory.getItemsSetsByInventory(items);
    const itemsSetsAttriributes = parse(array(attributesSchema), itemsSets);
    const harksFromItemsSets = itemsSetsAttriributes.reduce(assignWithSum, harksFromItems);

    this.harksFromItems = harksFromItemsSets;
    return harksFromItems;
  }

  toObject() {
    return {
      items: this.items.map((item) => ({ ...item, id: item.id || item._id.toString() })),
      equipment: Array.from(this.equipment.values()).map((item) => item.id),
    };
  }
}
