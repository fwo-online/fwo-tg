import _ from "lodash";
import mongoose, { Schema, type Model, type Query, type Types } from "mongoose";
import arena from "../arena";
import config from "../arena/config";
import type { Profs } from "../data";
import { CharModel, type Char } from "./character";

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
export interface InventoryDocument {
  _id: Types.ObjectId
  id: string

  code: string;
  wear: string;
  putOn: boolean;
  durable: number;
  owner: Char;
}

export type InventoryModel = Model<InventoryDocument> & typeof InventoryDocument;

export class InventoryDocument {
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
   * @return Объект нового инветаря
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
  ): Promise<InventoryDocument[] | undefined> {
    await CharModel.findByIdAndUpdate(
      charId,
      { $pull: { inventory: { $in: [itemId] } } },
      { new: true },
    );
    await this.findByIdAndDelete(itemId);
    return this.getItems(charId);
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
  ): Promise<InventoryDocument | undefined> {
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
    return this.deleteOne({
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
  ): Promise<InventoryDocument[]> {
    return this.find({ owner: charId });
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
