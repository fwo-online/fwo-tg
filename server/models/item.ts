import type { Model } from 'mongoose';
import mongoose, { Document, Schema } from 'mongoose';
import arena from '@/arena';
import type { Item } from '@fwo/shared';
import { attributesSchema } from '@fwo/shared';
import _ from 'lodash';
import { generateItems } from '@/helpers/itemHelper';
import { parse } from 'valibot';

export type ItemModel = Model<Item> & typeof ItemDocument;

export class ItemDocument extends Document<Item> {
  static async load(this: ItemModel) {
    const timer = Date.now();
    try {
      const items = await this.find({});
      if (items.length) {
        arena.items = _.keyBy(items, ({ code }) => code);
      } else {
        console.log('Items not found. Generating...');
        const items = await generateItems();
        console.log('Items file Loaded: ', Date.now() - timer, 'ms');

        const createdItems = await ItemModel.create(items);
        arena.items = _.keyBy(createdItems, ({ code }) => code);
      }
    } catch (e) {
      console.error(e);
    } finally {
      console.log('Items loaded.T:', Date.now() - timer, 'ms');
    }
  }

  /**
   * @description Собираем все харки со шмотки
   * @param itemCode код вещи
   */
  static getAttributes(this: ItemModel, itemCode: string) {
    return parse(attributesSchema, arena.items[itemCode]);
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
    code: {
      type: String,
      unique: true,
      required: true,
    },
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
  },
  {
    versionKey: false,
  },
);

item.loadClass(ItemDocument);

export const ItemModel = mongoose.model<Item, ItemModel>('Item', item);
