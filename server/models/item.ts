import type { Model, Types } from 'mongoose';
import mongoose, { Schema } from 'mongoose';
import arena from '@/arena';
import type { CharacterClass, ItemOutput } from '@fwo/shared';
import _ from 'lodash';
import { generateItems } from '@/helpers/itemHelper';
import type { Char } from '@/models/character';
import config from '@/arena/config';

export interface Item extends ItemOutput {
  _id: Types.ObjectId;
  id: string;

  createdBy: Char;
}

export type ItemModel = Model<Item> & typeof Item;

export class Item {
  static async load(this: ItemModel) {
    const timer = Date.now();
    try {
      console.log('Generate items...');
      const items = await generateItems();
      console.log('Items loaded: ', Date.now() - timer, 'ms');
      arena.items = _.keyBy(items, ({ code }) => code);
    } catch (e) {
      console.error(e);
    } finally {
      console.log('Items loaded. Total:', Date.now() - timer, 'ms');
    }
  }

  static async firstCreate(this: ItemModel, char: Char) {
    const defItemCode = getDefaultItem(char.prof);

    if (!defItemCode) return;
    const item = arena.items[defItemCode];

    return await this.create({ ...item, createdBy: char });
  }
}

/**
 * Item
 *
 * @description Модель предмета
 * @module Model/Item
 */

const item = new Schema<Item, ItemModel>(
  {
    code: { type: String, required: true },
    type: { type: String },
    info: { type: Object },
    price: { type: Number },
    wear: { type: String },
    class: { type: [String] },
    weight: { type: Number },
    requiredAttributes: { type: Object },
    attributes: { type: Object },
    base: { type: Object },
    phys: { type: Object },
    magic: { type: Object },
    heal: { type: Object },
    hit: { type: Object },
    craft: { type: Object },
    modifiers: { type: Object },
    tier: { type: Number },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Character' },
  },
  {
    versionKey: false,
    id: true,
  },
);

item.loadClass(Item);

/**
 * getDefaultItem
 * @param prof ID профы w/l/m/p
 * @return itemCode код дефолтного итема для данной профы
 * @description Получаем код дефолтного итема для данной профы
 *
 */
function getDefaultItem(characterClass: CharacterClass) {
  return config.defaultItems[characterClass] || console.log('no prof in getDefaultItem');
}

export const ItemModel = mongoose.model<Item, ItemModel>('Item', item);
