
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
  price: number | null;
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

interface ItemDocument extends Item, Document {
}

interface ItemModel extends Model<ItemDocument> {
  load(): void;
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
    type: {
      str: Number,
      dex: Number,
      wis: Number,
      int: Number,
      con: Number,
    },
  },
  plushark: {
    type: {
      str: Number,
      dex: Number,
      wis: Number,
      int: Number,
      con: Number,
    },
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
    type: { min: Number, max: Number },
  },
  mp_drain: {
    type: { min: Number, max: Number },
  },
  en_drain: {
    type: { min: Number, max: Number },
  },
  type: {
    type: String,
  },
  hit: {
    type: { min: Number, max: Number },
  },
  edinahp: {
    type: Number,
  },
  eff: {
    type: { min: Number, max: Number },
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
    type: { min: Number, max: Number },
  },
  acid: {
    type: { min: Number, max: Number },
  },
  lighting: {
    type: { min: Number, max: Number },
  },
  frost: {
    type: { min: Number, max: Number },
  },
}, { typePojoToMixed: false });

item.statics = {
  /**
   * Load/reload
   * @description Функция подгрузки итемов в память (arena.items)
   *
   */
  async load() {
    const timer1 = Date.now();
    try {
      const items = await this.model('Item').find({});
      if (Object.entries(items).length) {
        // console.log(items)
        arena.items = _.keyBy(items, 'code');
      } else {
        const shop = fs.readFileSync('shop.json', 'utf8');
        const createdItems = [];

        const shopArr = JSON.parse(shop);
        // eslint-disable-next-line no-console
        console.log('File Loaded: ', Date.now() - timer1, 'ms');

          _.forEach(shopArr, async (o, code) => {
            o.code = code;
            createdItems.push(this.model('Item').create(o));
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
   * @param {String} itemCode код вещи
   * @return {Object}
   */
  getHarks(itemCode) {
    const itemObj = ItemService.itemAtrParser(arena.items[itemCode]);
    return _.pick(itemObj, config.parseAttr);
  },
};

export default mongoose.model<ItemDocument, ItemModel>('Item', item);
