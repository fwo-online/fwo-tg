import _ from 'lodash';
import mongoose, {
  Schema, Model, Query, Types,
} from 'mongoose';
import arena from '../arena';
import config from '../arena/config';
import { Collections, Profs } from '../data';
import { CharModel, Char } from './character';
import {
  ItemModel, ParseAttrItem, Item,
} from './item';

/**
 * getDefaultItem
 * @param prof ID профы w/l/m/p
 * @return itemCode код дефолтного итема для данной профы
 * @description Получаем код дефолтного итема для данной профы
 *
 */
function getDefaultItem(prof: Profs.Prof) {
  return config.defaultItems[prof] || console.log('no prof in getDefaultItem');
}
export interface Inventory {
  _id: Types.ObjectId
  id: string

  code: string;
  wear: string;
  putOn: boolean;
  durable: number;
  owner: Char;
}

export type InventoryModel = Model<Inventory> & typeof Inventory;

export class Inventory {
  /**
   * fullHarks
   *
   * @desc Возвращает  суммарный объект всех суммирующихся характеристик от
   * одетых вещей внутри инвентаря чара
   * @param charId Идентификатор чара чей inventory нужно пропарсить
   * @todo нужна фунция которая выбирает коды всех одеты вещей в инвентаре
   * а затем суммирует все полученные данны в единый объект.
   */
  static async fullHarks(
    this: InventoryModel,
    charId: string,
  ): Promise<ParseAttrItem> {
    // берем из базы все надетые вещи
    const allItems = await this.getPutOned(charId);
    // Складываем все характеристики от вещей в одоин общий объект
    return _.reduce(allItems, (ob, i) => {
      // берем характеристики вещи
      const f = ItemModel.getHarks(i.code);
      // делаем слияние общего объекта и объекта вещи
      return _.assignInWith(ob, f, (objValue, srcValue) => {
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
  }

  /**
   * Возвращает массив одетых вещей в инвентаре
   * @param charId
   */
  static async getPutOned(
    this: InventoryModel,
    charId: string,
  ): Promise<Inventory[]> {
    const invObj = await this.find({ owner: charId });
    return _.filter(invObj, { putOn: true });
  }

  /**
   * addItem
   *
   * @description Функция добавления итема в инвентарь
   * @param charId Идентификатор чара
   * @param itemCode Код итема который следует добавить
   * @return Объект нового инветаря
   */
  static async addItem(
    this: InventoryModel,
    charId: string,
    itemCode: string,
  ): Promise<Inventory> {
    const item = await this.create({
      owner: charId, code: itemCode, wear: arena.items[itemCode].wear, putOn: false, durable: 10,
    });
    return item;
  }

  /**
   * delItem
   * @description Удаление итема из инвентаря чара (итем обязан быть снят)
   * @param charId идентификатор чара
   * @param itemId идентификатор итема в инвенторе
   * @return Массив нового инвентаря
   */
  static async delItem(
    this: InventoryModel,
    charId: string,
    itemId: string,
  ): Promise<Inventory[] | void> {
    const char = await CharModel.findById(charId);
    _.pull(char?.inventory as unknown as string[], itemId);
    await char?.save();
    await this.findByIdAndDelete(itemId);
    return char?.inventory;
  }

  /**
   * firstCreate
   * @description Функция заведения инвентаря
   * Данная функция нужна для создания инвенторя в момент создания чара
   * т.к инветарь не связан на прямую и для его создания нужно сначала получить
   * ownerId чара.
   * @param charObj объект созданного чара
   * @return Item созданный итем
   */
  static async firstCreate(
    this: InventoryModel,
    charObj: Char,
  ): Promise<Inventory | void> {
    const defItemCode = getDefaultItem(charObj.prof);

    if (!defItemCode) return;

    const item = await this.addItem(charObj.id, defItemCode);
    if (item) {
      await this.putOnItem(charObj.id, item.id);
      return item;
    }
  }

  /**
   * putOnItem
   * @description Пытаемся одеть указанный итем.
   * @param charId ID чара
   * @param itemId Идентификатор итема внутри инвенторя пользователя
   * @return Массив нового инвентаря
   */
  static async putOnItem(
    this: InventoryModel,
    charId: string,
    itemId: string,
  ): Promise<unknown> {
    console.log('PUT ON ITEM', charId, itemId);
    return this.updateOne({
      owner: charId,
      _id: itemId,
    }, {
      putOn: true,
    });
  }

  /**
   * putOffItem
   * @description Пытаемся снять указанный итем.
   * @param charId ID чара
   * @param itemId Идентификатор итема внутри инвенторя пользователя
   * @return ItemObject после изменения его в базе
   */
  static async putOffItem(
    this: InventoryModel,
    charId: string,
    itemId: string,
  ): Promise<unknown> {
    return this.updateOne({
      owner: charId,
      _id: itemId,
    }, {
      putOn: false,
    });
  }

  /**
   * Функция возвращает объект ItemObj привязанному к персонажу
   * @param itemId
   * @param charId
   */
  static async getItem(
    this: InventoryModel,
    itemId: string,
    charId: string,
  ): Promise<Inventory | null> {
    return this.findOne({
      owner: charId,
    }, {
      _id: itemId,
    });
  }

  /**
   * @param charId идентификатор персонажа
   * @param itemId идентификатор предмета
   */
  static removeItem(
    this: InventoryModel,
    itemId: string,
    charId: string,
  ): Query<unknown, Inventory> {
    return this.remove({
      owner: charId,
      _id: itemId,
    });
  }

  /**
   * Функция возвращает массив всех объектов относящихся к персонажу
   * @param charId
   * @return массив обтектов персонажа
   */
  static async getItems(
    this: InventoryModel,
    charId: string,
  ): Promise<Inventory[]> {
    return this.find({ owner: charId });
  }

  static getCollection(
    this: InventoryModel,
    charInventory: Inventory[],
  ): Collections.Collection | undefined {
    const items: Item[] = charInventory.map(({ code }) => arena.items[code]);
    const playerCollection = _.groupBy(items, (item) => item.wcomb[0]);
    const itemsCollection = _.groupBy(arena.items, (item: Item) => item.wcomb[0]);

    const playerCollectionsKeys: string[] = _.uniq(Object.keys(playerCollection));
    const [fullSets, smallSets] = _.partition(playerCollectionsKeys, (key) => key.endsWith('f'));

    const findCollection = (key: string): boolean => {
      if (itemsCollection[key]) {
        return playerCollection[key].length === itemsCollection[key].length;
      }
      return false;
    };

    const foundSmallCollection = smallSets.find(findCollection);
    if (foundSmallCollection) {
      const foundFullCollection = fullSets.find(findCollection);
      if (foundFullCollection) {
        return Collections.collectionsData[foundFullCollection];
      }
      return Collections.collectionsData[foundSmallCollection];
    }
    return undefined;
  }

  /**
   * Функция возращает имя вещи
   * @param itemCode
   * @return displayName вещи
   */
  static getItemName(
    this: InventoryModel,
    itemCode: string,
  ): string {
    return arena.items[itemCode].name;
  }
}

/**
 * Inventory
 *
 * @description Модель инвентаря чара
 * @module Model/Inventory
 */

const inventory = new Schema<Inventory, InventoryModel>({
  code: { type: String, required: true },
  wear: { type: String, required: true },
  putOn: { type: Boolean, default: false },
  durable: { type: Number, default: 10 },
  // Добавляем связь инвенторя с персонажем charID
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character',
    required: true,
  },
});

inventory.loadClass(Inventory);

export const InventoryModel = mongoose.model<Inventory, InventoryModel>('Inventory', inventory);
