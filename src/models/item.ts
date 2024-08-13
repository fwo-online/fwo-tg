import _ from 'lodash';
import type { Model } from 'mongoose';
import mongoose, { Schema } from 'mongoose';
import arena from '@/arena';
import type { ParseAttr } from '@/arena/config';
import config from '@/arena/config';
import type { Harks } from '@/data';

export type MinMax = {
  min: number;
  max: number;
}

export interface Item {
  code: string;
  name: string;
  patk: number | null;
  pdef: number | null;
  price: number;
  wear: string;
  race: string;
  weight: number | null;
  gskill: string;
  gprice: string;
  wcomb: string[];
  hark: Partial<Harks.HarksLvl> | null;
  plushark: Partial<Harks.HarksLvl> | null;
  mga: number | null;
  mgp: number | null;
  hl: MinMax | null;
  add_hp: number | null;
  add_mp: number | null;
  add_en: number | null;
  reg_hp: number | null;
  reg_en: number | null;
  reg_mp: number | null;
  hp_drain: MinMax | null;
  mp_drain: MinMax | null;
  en_drain: MinMax | null;
  hit: MinMax | null;
}

export type ParseAttrItem = Pick<Item, ParseAttr>

export type ItemModel = Model<Item> & typeof Item;

export class Item {
  static async load(this: ItemModel): Promise<void> {
    const timer1 = Date.now();
    try {
      const items = await this.find({});
      if (Object.entries(items).length) {
        arena.items = _.keyBy(items, 'code');
      } else {
        const shop = await import('@/items.json') satisfies Omit<Item, '_id' | 'id'>[];
        console.log('File Loaded: ', Date.now() - timer1, 'ms');

        const createdItems = await ItemModel.create(shop);
        arena.items = _.keyBy(createdItems, 'code');
      }
    } catch (e) {
      console.error(e);
    } finally {
      console.log('Items loaded.T:', Date.now() - timer1, 'ms');
    }
  }

  /**
   * @description Собираем все харки со шмотки
   * @param itemCode код вещи
   */
  static getHarks(this: ItemModel, itemCode: string): Partial<Pick<Item, ParseAttr>> {
    const omittedItem = _.omitBy(arena.items[itemCode], _.isNull);
    return _.pick(omittedItem, config.parseAttr);
  }
}

/**
 * Item
 *
 * @description Модель предмета
 * @module Model/Item
 */

const item = new Schema<Item, ItemModel>({
  code: {
    type: String, unique: true, required: true, dominant: true,
  },
  name: {
    type: String,
  },
  patk: {
    type: Number,
  },
  pdef: {
    type: Number,
  },
  price: {
    type: Number,
  },
  wear: {
    type: String,
  },
  race: {
    type: String,
  },
  weight: {
    type: Number,
  },
  gskill: {
    type: String,
  },
  gprice: {
    type: String,
  },
  wcomb: {
    type: [String],
  },
  hark: {
    type: Object,
  },
  plushark: {
    type: Object,
  },
  mga: {
    type: Number,
  },
  mgp: {
    type: Number,
  },
  hl: {
    type: Object,
  },
  add_hp: {
    type: Number,
  },
  add_mp: {
    type: Number,
  },
  add_en: {
    type: Number,
  },
  reg_hp: {
    type: Number,
  },
  reg_en: {
    type: Number,
  },
  reg_mp: {
    type: Number,
  },
  hp_drain: {
    type: Object,
  },
  mp_drain: {
    type: Object,
  },
  en_drain: {
    type: Object,
  },
  hit: {
    type: Object,
  },
}, {
  versionKey: false,
});

item.loadClass(Item);

export const ItemModel = mongoose.model<Item, ItemModel>('Item', item);
