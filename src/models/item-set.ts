import { isEmpty, keyBy } from 'lodash';
import arena from '@/arena';
import type { Harks } from '@/data';
import type { MinMax } from '@/models/item';

export interface ItemSet {
  code: string;
  full_set?: string;
  name: string;
  items: string[];
  patk: number | null;
  pdef: number | null;
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
}

export class ItemSetModel {
  static async load() {
    if (isEmpty(arena.itemSets)) {
      const itemsSet = await import('@/item-sets.json') satisfies ItemSet[];

      arena.itemSets = keyBy(itemsSet, ({ code }) => code);
    }

    return arena.itemSets;
  }
}
