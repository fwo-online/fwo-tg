import _ from 'lodash';
import {
  getCollection,
  getItems,
  addItem,
  removeItem,
  putOnItem,
  putOffItem,
} from '@/api/inventory';
import arena from '@/arena';
import ValidationError from '@/arena/errors/ValidationError';
import type { Char } from '@/models/character';
import type { Inventory } from '@/models/inventory';
import type { Item, ParseAttrItem } from '@/models/item';
import { ItemModel } from '@/models/item';
import { assignWithSum } from '@/utils/assignWithSum';

class InventoryService {
  harksFromItems: Partial<ParseAttrItem>;

  constructor(private char: Char, public inventory: Inventory[]) {
    this.updateHarkFromItems();
  }

  /**
   * Нужно помнить, что this.harks это суммарный объект,
   * с уже полученными от вещей характеристиками
   * */
  get harks() {
    const charHarks = { ...this.char.harks };
    const plusHarks = this.plushark;
    const collectionHarks = this.collection?.harks;

    if (!_.isEmpty(plusHarks)) {
      assignWithSum(charHarks, plusHarks);
    }
    if (!_.isUndefined(collectionHarks)) {
      assignWithSum(charHarks, collectionHarks);
    }
    return charHarks;
  }

  get plushark() {
    return this.harksFromItems.plushark;
  }

  get collection() {
    return getCollection(this.getEquippedItems());
  }

  get resists() {
    return this.collection?.resists;
  }

  get chance() {
    return this.collection?.chance;
  }

  get statical() {
    return this.collection?.statical;
  }

  getItem(itemId) {
    return this.inventory.find((item) => item._id.equals(itemId));
  }

  getEquippedItems() {
    return this.inventory.filter((item) => item.putOn);
  }

  getEquippedWeapon() {
    return this.getEquippedItems().find(
      (item) => /^ab?$/.test(item.wear) && item.putOn,
    );
  }

  canEquip(itemToEquip: Item) {
    return !this.getEquippedItems().some(
      (item) => item.wear.includes(itemToEquip.wear)
        || itemToEquip.wear.includes(item.wear),
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

    if (!this.hasRequiredHarks(item)) {
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
      (i) => !this.hasRequiredHarks(arena.items[i.code]),
    );
    if (items.length) {
      const putOffItems = items.map((i) => putOffItem({ charId: this.char.id, itemId: i.id }));
      await Promise.all(putOffItems);
      await this.unEquipNonEquippableItems();
    }
  }

  hasRequiredHarks(item: Item) {
    if (item.hark) {
      return Object.entries(item.hark).every(
        ([hark, val]) => val <= this.char.harks[hark],
      );
    }
    return true;
  }

  /**
   * Функция пересчитывает все характеристики,
   * которые были получены от надетых вещей в инвентаре персонажа
   */
  updateHarkFromItems() {
    const harksFromItems = this.getEquippedItems().reduce((sum, { code }) => {
      // берем характеристики вещи
      const attributes = ItemModel.getHarks(code);
      // делаем слияние общего объекта и объекта вещи
      return _.assignInWith(sum, attributes, (objValue, srcValue) => {
        // Если в общем обтекте в этом ключе НЕ пустое значине
        if (!_.isEmpty(objValue) || _.isNumber(objValue)) {
          // и если этот ключ объекта является Объектом
          if (_.isObject(objValue)) {
            // то складываем два этих объекта
            _.assignInWith(objValue, srcValue, (o, s) => +o + +s);
            return objValue;
          }
          // если ключ не является Объектом, складываем значения
          return +objValue + +srcValue;
        }
        // Если в общем объекте пустое значение, то берем значение вещи
        return srcValue;
      });
    }, {} as ParseAttrItem);

    if (!harksFromItems || !Object.keys(harksFromItems).length) {
      this.harksFromItems = { hit: { min: 0, max: 0 } };
    } else {
      this.harksFromItems = harksFromItems;
    }

    if (this.statical) {
      assignWithSum(this.harksFromItems, this.statical);
    }
  }
}

export default InventoryService;
