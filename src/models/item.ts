import fs from 'node:fs';
import _ from 'lodash';
import mongoose, { Schema, type Model, type Types } from 'mongoose';
import arena from '../arena';
import config, { type ParseAttr } from '../arena/config';
import type { Harks } from '../data';

const parseAttr = (p: string) => {
  try {
    if (p !== '') {
      return JSON.parse(p);
    }
    return null;
  } catch {
    return null;
  }
};

export type MinMax = {
  min: number;
  max: number;
}

export interface Item {
  _id: Types.ObjectId
  id: string

  code: string;
  name: string;
  atc: number | null;
  prt: number | null;
  price: number;
  wear: string;
  race: string;
  weight: number | null;
  gskill: string;
  gprice: string;
  wcomb: string[];
  hark: Harks.HarksLvl | null;
  plushark: Harks.HarksLvl | null;
  mga: number | null;
  mgp: number | null;
  hl: MinMax | null;
  r_fire: number | null;
  r_acid: number | null;
  r_lighting: number | null;
  r_frost: number | null;
  r_physical: number | null;
  chance: number | null;
  descr: string;
  add_hp: number | null;
  add_mp: number | null;
  add_en: number | null;
  onlymake: boolean;
  subclass: boolean;
  reg_hp: number | null;
  reg_en: number | null;
  reg_mp: number | null;
  hp_drain: MinMax | null;
  mp_drain: MinMax | null;
  en_drain: MinMax | null;
  type: string;
  hit: MinMax | null;
  edinahp: number | null;
  eff: MinMax | null;
  hide: boolean;
  wtype: string;
  '2handed': boolean;
  case: string;
  fire: MinMax | null;
  acid: MinMax | null;
  lighting: MinMax | null;
  frost: MinMax | null;
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
        const shop = fs.readFileSync('shop.json', 'utf8');
        const itemsToCreate: Promise<Item>[] = [];

        const parsedShop: Record<string, Item> = JSON.parse(shop);
        console.log('File Loaded: ', Date.now() - timer1, 'ms');

        _.forEach(parsedShop, async (o, code) => {
          o.code = code;
          itemsToCreate.push(ItemModel.create(o));
          return true;
        });

        const createdItems = await Promise.all(itemsToCreate);

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
  atc: {
    type: Number,
  },
  prt: {
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
  // @ts-expect-error cast as string
  wcomb: {
    type: String,
    get: (comb) => comb.split(','),
  },
  hark: {
    type: String,
    get: parseAttr,
  },
  plushark: {
    type: String,
    get: parseAttr,
  },
  mga: {
    type: Number,
  },
  mgp: {
    type: Number,
  },
  hl: {
    type: Number,
    get: (hl: null | number) => ({ min: 0, max: hl ?? 0 }),
  },
  r_fire: {
    type: Number,
  },
  r_acid: {
    type: Number,
  },
  r_lighting: {
    type: Number,
  },
  r_frost: {
    type: Number,
  },
  r_physical: {
    type: Number,
  },
  chance: {
    type: Number,
  },
  descr: {
    type: String,
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
  onlymake: {
    type: Boolean,
  },
  subclass: {
    type: Boolean,
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
    type: String,
    get: parseAttr,
  },
  mp_drain: {
    type: String,
    get: parseAttr,
  },
  en_drain: {
    type: String,
    get: parseAttr,
  },
  type: {
    type: String,
  },
  hit: {
    type: String,
    get: parseAttr,
  },
  edinahp: {
    type: Number,
  },
  eff: {
    type: String,
    get: parseAttr,
  },
  hide: {
    type: Boolean,
  },
  wtype: {
    type: String,
  },
  '2handed': {
    type: Boolean,
  },
  case: {
    type: String,
  },
  fire: {
    type: String,
    get: parseAttr,
  },
  acid: {
    type: String,
    get: parseAttr,
  },
  lighting: {
    type: String,
    get: parseAttr,
  },
  frost: {
    type: String,
    get: parseAttr,
  },
}, {
  versionKey: false,
});

item.loadClass(Item);

export const ItemModel = mongoose.model<Item, ItemModel>('Item', item);
