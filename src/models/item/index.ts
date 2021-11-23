import fs from 'fs';
import _ from 'lodash';
import mongoose, {
  Schema, Document, Model, DocumentDefinition,
} from 'mongoose';
import arena from '../../arena';
import config, { ParseAttr } from '../../arena/config';
import type { Harks } from '../../data';

const parseAttr = <T>(p: string): T | null => {
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

export interface ItemDocument extends Document {
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

export type Item = DocumentDefinition<ItemDocument>

export type ParseAttrItem = Pick<Item, ParseAttr>

export type ItemModel = Model<ItemDocument> & typeof ItemDocument;

export class ItemDocument {
  static async load(this: ItemModel): Promise<void> {
    const timer1 = Date.now();
    try {
      const items = await this.find({});
      if (Object.entries(items).length) {
        arena.items = _.keyBy(items, 'code');
      } else {
        const shop = fs.readFileSync('shop.json', 'utf8');
        const createdItems: Promise<ItemDocument>[] = [];

        const parsedShop: Record<string, ItemDocument> = JSON.parse(shop);
        console.log('File Loaded: ', Date.now() - timer1, 'ms');

        _.forEach(parsedShop, async (o, code) => {
          o.code = code;
          createdItems.push(ItemModel.create(o));
          return true;
        });

        await Promise.all(createdItems);

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

const item = new Schema<ItemDocument, ItemModel>({
  code: {
    type: Schema.Types.String, unique: true, required: true, dominant: true,
  },
  name: {
    type: Schema.Types.String,
  },
  atc: {
    type: Schema.Types.Number,
  },
  prt: {
    type: Schema.Types.Number,
  },
  price: {
    type: Schema.Types.Number,
  },
  wear: {
    type: Schema.Types.String,
  },
  race: {
    type: Schema.Types.String,
  },
  weight: {
    type: Schema.Types.Number,
  },
  gskill: {
    type: Schema.Types.String,
  },
  gprice: {
    type: Schema.Types.String,
  },
  wcomb: {
    type: Schema.Types.String,
    get: (comb: string) => comb.split(','),
  },
  hark: {
    type: Schema.Types.String,
    get: (value) => parseAttr<Harks.Hark>(value),
  },
  plushark: {
    type: Schema.Types.String,
    get: (value) => parseAttr<Harks.Hark>(value),
  },
  mga: {
    type: Schema.Types.Number,
  },
  mgp: {
    type: Schema.Types.Number,
  },
  hl: {
    type: Schema.Types.Number,
    get: (hl) => ({ min: 0, max: hl ?? 0 }),
  },
  r_fire: {
    type: Schema.Types.Number,
  },
  r_acid: {
    type: Schema.Types.Number,
  },
  r_lighting: {
    type: Schema.Types.Number,
  },
  r_frost: {
    type: Schema.Types.Number,
  },
  r_physical: {
    type: Schema.Types.Number,
  },
  chance: {
    type: Schema.Types.Number,
  },
  descr: {
    type: Schema.Types.String,
  },
  add_hp: {
    type: Schema.Types.Number,
  },
  add_mp: {
    type: Schema.Types.Number,
  },
  add_en: {
    type: Schema.Types.Number,
  },
  onlymake: {
    type: Schema.Types.Boolean,
  },
  subclass: {
    type: Schema.Types.Boolean,
  },
  reg_hp: {
    type: Schema.Types.Number,
  },
  reg_en: {
    type: Schema.Types.Number,
  },
  reg_mp: {
    type: Schema.Types.Number,
  },
  hp_drain: {
    type: Schema.Types.String,
    get: (value) => parseAttr<MinMax>(value),
  },
  mp_drain: {
    type: Schema.Types.String,
    get: (value) => parseAttr<MinMax>(value),
  },
  en_drain: {
    type: Schema.Types.String,
    get: (value) => parseAttr<MinMax>(value),
  },
  type: {
    type: Schema.Types.String,
  },
  hit: {
    type: Schema.Types.String,
    get: (value) => parseAttr<MinMax>(value),
  },
  edinahp: {
    type: Schema.Types.Number,
  },
  eff: {
    type: Schema.Types.String,
    get: (value) => parseAttr<MinMax>(value),
  },
  hide: {
    type: Schema.Types.Boolean,
  },
  wtype: {
    type: Schema.Types.String,
  },
  '2handed': {
    type: Schema.Types.Boolean,
  },
  case: {
    type: Schema.Types.String,
  },
  fire: {
    type: Schema.Types.String,
    get: (value) => parseAttr<MinMax>(value),
  },
  acid: {
    type: Schema.Types.String,
    get: (value) => parseAttr<MinMax>(value),
  },
  lighting: {
    type: Schema.Types.String,
    get: (value) => parseAttr<MinMax>(value),
  },
  frost: {
    type: Schema.Types.String,
    get: (value) => parseAttr<MinMax>(value),
  },
}, {
  versionKey: false,
});

item.loadClass(ItemDocument);

export const ItemModel = mongoose.model<ItemDocument, ItemModel>('Item', item);
