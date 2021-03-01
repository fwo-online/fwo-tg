import _ from 'lodash';
import mongoose, {
  Schema, Document, Model, DocumentDefinition, Query,
} from 'mongoose';
import arena from '../arena';
import config from '../arena/config';
import { Collections, Profs } from '../data';
import { CharModel, CharDocument } from './character';
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
  // eslint-disable-next-line no-console
  return config.defaultItems[prof] || console.log('no prof in getDefaultItem');
}
export interface InventoryDocument extends Document<string> {
  code: string;
  wear: string;
  putOn: boolean;
  durable: number;
  owner: string;
}

export type InventoryModel = Model<InventoryDocument> & typeof InventoryDocument;

export class InventoryDocument {
  /**
   * fullHarks
   *
   * @desc Возвращает  суммарный обьект всех суммирующихся характеристик от
   * одетых вещей внутри инвентаря чара
   * @param charId Идентификатор чара чей inventory нужно пропарсить
   * @todo нужна фунция которая выбирает коды всех одеты вещей в инвентаре
   * а затем суммирует все полученные данны в единый обьект.
   */
  static async fullHarks(
    this: InventoryModel,
    charId: string,
  ): Promise<ParseAttrItem> {
    // берем из базы все надетые вещи
    const allItems = await this.getPutOned(charId);
    // Складываем все характеристики от вещей в одоин общий обьект
    return _.reduce(allItems, (ob, i) => {
      // берем характеристики вещи
      const f = ItemModel.getHarks(i.code);
      // делаем слияние общего обьекта и обьекта вещи
      return _.assignInWith(ob, f, (objValue, srcValue) => {
        // Если в общем обтекте в этом ключе НЕ пустое значине
        if (!_.isEmpty(objValue) || _.isNumber(objValue)) {
          // и если этот ключ обьекта является Обьектом
          if (_.isObject(objValue)) {
            // то складываем два этих обьекта
            _.assignInWith(objValue, srcValue, (o, s) => +o + +s);
            return objValue;
          }
          // если ключ не является Обьектом, складываем значения
          return +objValue + +srcValue;
        }
        // Если в общем обьекте пустое значение, то берем значение вещи
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
  ): Promise<InventoryDocument[]> {
    const invObj = await this.find({ owner: charId });
    return _.filter(invObj, { putOn: true });
  }

  /**
   * addItem
   *
   * @description Функция добавления итема в инвентарь
   * @param charId Идентификатор чара
   * @param itemCode Код итема который следует добавить
   * @return Обьект нового инветаря
   */
  static async addItem(
    this: InventoryModel,
    charId: string,
    itemCode: string,
  ): Promise<InventoryDocument> {
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
  ): Promise<InventoryDocument[] | void> {
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
   * @param charObj обьект созданного чара
   * @return Item созданный итем
   */
  static async firstCreate(
    this: InventoryModel,
    charObj: CharDocument,
  ): Promise<InventoryDocument | void> {
    const defItemCode = getDefaultItem(charObj.prof);

    if (!defItemCode) return;

    const item = await this.addItem(charObj._id, defItemCode);
    if (item) {
      await this.putOnItem(charObj._id, item.id);
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
   * Функция возвращает обьект ItemObj привязанному к персонажу
   * @param itemId
   * @param charId
   */
  static async getItem(
    this: InventoryModel,
    itemId: string,
    charId: string,
  ): Promise<InventoryDocument | null> {
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
  ): Query<unknown, InventoryDocument> {
    return this.remove({
      owner: charId,
      _id: itemId,
    });
  }

  /**
   * Функция возвращает массив всех обьектов относящихся к персонажу
   * @param charId
   * @return массив обтектов персонажа
   */
  static async getItems(
    this: InventoryModel,
    charId: string,
  ): Promise<InventoryDocument[]> {
    return this.find({ owner: charId });
  }

  static getCollection(
    this: InventoryModel,
    charInventory: InventoryDocument[],
  ): Collections.Collection | undefined {
    const items: Item[] = charInventory.map(({ code }) => arena.items[code]);
    const playerCollection = _.groupBy(items, (item) => item.wcomb[0]);
    const itemsCollection = _.groupBy(arena.items, (item) => item.wcomb[0]);

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

export type Inventory = DocumentDefinition<InventoryDocument>

/**
 * Inventory
 *
 * @description Модель инвентаря чара
 * @module Model/Inventory
 */

const inventory = new Schema<InventoryDocument, InventoryModel>({
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

inventory.loadClass(InventoryDocument);

export const InventoryModel = mongoose.model<InventoryDocument, InventoryModel>('Inventory', inventory);
