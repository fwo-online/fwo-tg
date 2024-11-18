import type { Model } from 'mongoose';
import mongoose, { Document, Schema } from 'mongoose';
import arena from '@/arena';
import type { Item  } from '@/schemas/item';
import { itemAttributesSchema } from '@/schemas/item/itemAttributesSchema';
import _ from 'lodash';
import { generateItemsSets } from '@/helpers/itemHelper';
import type { ItemSet } from '@/schemas/itemSet/itemSetSchema';

export type ItemSetModel = Model<ItemSet> & typeof ItemSetDocument;

export class ItemSetDocument extends Document<Item> {
  static async load(this: ItemSetModel) {
    const timer = Date.now();
    try {
      const items = await this.find({});
      if (items.length) {
        arena.itemsSets = _.keyBy(items, ({ code }) => code);
      } else {
        const itemsSets = await generateItemsSets()
        console.log('File Loaded: ', Date.now() - timer, 'ms');

        const createdItems = await ItemSetModel.create(itemsSets);
        arena.itemsSets = _.keyBy(createdItems, ({ code }) => code);
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
  static getAttributes(this: ItemSetModel, itemCode: string) {
    return itemAttributesSchema.parse(arena.items[itemCode])
  }
}

/**
 * Item
 *
 * @description Модель комплекта
 * @module Model/ItemSet
 */

const itemSet = new Schema<ItemSet, ItemSetModel>({
  code: {
    type: String, unique: true, required: true
  },
  info: { type: Object },
  requiredAttributes: { type: Object },
  attributes: { type: Object },
  base: { type: Object },
  phys: { type: Object },
  magic: { type: Object },
  heal: { type: Object },
  hit: { type: Object },
}, {
  versionKey: false,
});

itemSet.loadClass(ItemSetDocument);

export const ItemSetModel = mongoose.model<ItemSet, ItemSetModel>('Item', itemSet);
