
import _ from 'lodash';
import fs from 'fs';
import mongoose, { Schema, Document, Model } from 'mongoose';
import arena from '../arena';
import config from '../arena/config';
import ItemService from '../arena/ItemService';

export type MinMax = {
  min: number;
  max: number;
}
export type Hark = {
  str: number;
  dex: number;
  wis: number;
  int: number;
  con: number;
}

export interface Item {
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
  wcomb: string;
  hark: Hark | null;
  plushark: Hark | null;
  mga: number | null;
  mgp: number | null;
  hl: number | null;
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

export interface ItemDocument extends Item, Document {
}

export interface ItemModel extends Model<ItemDocument> {
  load(): void;
}

const parseAttr = (p: string) => {
  try {
    if (p !== '') {
      return JSON.parse(p);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Item
 *
 * @description Модель предмета
 * @module Model/Item
 */

const item = new Schema({
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
  wcomb: {
    type: String,
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
  typePojoToMixed: false,
  versionKey: false,
});

item.statics = {
  /**
   * Load/reload
   * @description Функция подгрузки итемов в память (arena.items)
   *
   */
  async load() {
    const timer1 = Date.now();
    try {
      const items = await mongoose.model<ItemDocument, ItemModel>('Item').find({});
      if (Object.entries(items).length) {
        // console.log(items)
        arena.items = _.keyBy(items, 'code');
      } else {
        const shop = fs.readFileSync('shop.json', 'utf8');
        const createdItems: Promise<ItemDocument>[] = [];

        const shopArr: Record<string, ItemDocument> = JSON.parse(shop);
        // eslint-disable-next-line no-console
        console.log('File Loaded: ', Date.now() - timer1, 'ms');

          _.forEach(shopArr, async (o, code) => {
            o.code = code;
            createdItems.push(mongoose.model<ItemDocument, ItemModel>('Item').create(o));
            return true;
          });

        await Promise.all(createdItems);

        arena.items = _.keyBy(items, 'code');
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      // eslint-disable-next-line no-console
      console.log('Items loaded.T:', Date.now() - timer1, 'ms');
    }
  },
  /**
   * @description Собираем все харки со шмотки
   * @param itemCode код вещи
   */
  getHarks(itemCode: string) {
    const item = arena.items[itemCode];
    return _.pick(item, config.parseAttr);
  },
};

export default mongoose.model<ItemDocument, ItemModel>('Item', item);
