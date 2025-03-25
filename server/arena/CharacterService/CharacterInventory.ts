import arena from '@/arena';
import ValidationError from '@/arena/errors/ValidationError';
import type { Char } from '@/models/character';
import { ItemWear } from '@fwo/shared';
import { attributesSchema, type Attributes } from '@fwo/shared';
import type { ItemSet } from '@fwo/shared';
import type { Modifiers } from '@fwo/shared';
import { assignWithSum } from '@/utils/assignWithSum';
import { array, parse } from 'valibot';
import { every } from 'es-toolkit/compat';
import type { Item } from '@/models/item';
import { updateCharacter } from '@/api/character';

export class CharacterInventory {
  harksFromItems: Attributes;
  items: Item[];
  equipment: Map<ItemWear, Item>;

  constructor(private readonly character: Char) {
    this.items = character.items;
    this.equipment = character.equipment;
    this.harksFromItems = this.updateHarkFromItems();
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
    return this.harksFromItems.attributes;
  }

  get modifiers() {
    return CharacterInventory.getItemSetsModifiersByInventory(this.items);
  }

  getItem(itemId: string) {
    return this.items.find((item) => item._id.equals(itemId));
  }

  getEquippedWeapon() {
    return this.equipment.get(ItemWear.MainHand) || this.equipment.get(ItemWear.TwoHands);
  }

  canEquip(itemToEquip: Item) {
    if (this.equipment.has(itemToEquip.wear)) {
      return false;
    }

    if (itemToEquip.wear === ItemWear.MainHand && this.equipment.has(ItemWear.TwoHands)) {
      return false;
    }

    if (itemToEquip.wear === ItemWear.TwoHands && this.equipment.has(ItemWear.MainHand)) {
      return false;
    }

    return true;
  }

  isEquipped(item: Item) {
    return Object.values(this.equipment).some((equippedItem) => equippedItem._id.equals(item.id));
  }

  async addItem(item: Item) {
    this.items.push(item);

    await this.save();
  }

  async removeItem(itemId: string) {
    const item = this.getItem(itemId);
    if (!item) {
      throw new ValidationError('Предмет не найден');
    }
    if (this.isEquipped(item)) {
      throw new ValidationError('Нельзя продать надетый предмет');
    }

    this.items = this.items.filter(({ id }) => item.id !== id);
    this.unEquipNonEquippableItems();

    await this.save();

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

    await this.save();
  }

  async unEquipItem(itemId: string) {
    const item = this.getItem(itemId);
    if (!item) {
      throw new ValidationError('Предмет не найден');
    }

    this.equipment.delete(item.wear);
    await this.unEquipNonEquippableItems();

    await this.save();
  }

  async unEquipNonEquippableItems() {
    this.updateHarkFromItems();

    for (const wear in this.equipment) {
      const item = this.equipment.get(wear as ItemWear);

      if (item && !this.hasRequiredAttributes(item)) {
        return this.unEquipItem(item.id);
      }
    }
  }

  hasRequiredAttributes(item: Item) {
    return every(item.requiredAttributes, (value, attr) => value <= this.character.harks[attr]);
  }

  /**
   * Функция пересчитывает все характеристики,
   * которые были получены от надетых вещей в инвентаре персонажа
   */
  updateHarkFromItems() {
    const equippedItems = Object.values(this.equipment);
    console.log(equippedItems);
    const itemAttriributes = parse(array(attributesSchema), equippedItems);
    const harksFromItems = itemAttriributes.reduce(assignWithSum, parse(attributesSchema, {}));

    const itemsSets = CharacterInventory.getItemsSetsByInventory(equippedItems);
    const itemsSetsAttriributes = parse(array(attributesSchema), itemsSets);
    const harksFromItemsSets = itemsSetsAttriributes.reduce(assignWithSum, harksFromItems);

    this.harksFromItems = harksFromItemsSets;
    return harksFromItems;
  }

  toObject() {
    return {
      items: this.items,
      equipment: Object.fromEntries(
        this.equipment
          .entries()
          .map(([wear, item]) => [wear, { ...item, id: item._id.toString() }]),
      ) as Record<ItemWear, Item>,
    };
  }

  private async save() {
    try {
      updateCharacter(this.character.id, {
        items: this.items,
        equipment: this.items,
      });
    } catch (e) {
      console.log('Fail on Inventory Save: ', e);
    }
  }
}
