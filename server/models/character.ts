import mongoose, { Schema, type Model, type Types } from 'mongoose';
import type { Profs, Harks } from '../data';
import type { Clan } from './clan';
import type { InventoryDocument } from './inventory';
// import type { Hark } from '../data/harks';

export interface Char {
  _id: Types.ObjectId
  id: string

  owner: string;
  nickname: string;
  birthday: Date;
  prof: Profs.Prof;
  exp: number;
  harks: Harks.HarksLvl;
  statistics: {
    games: number;
    kills: number;
    death: number;
    runs: number;
  },
  gold: number;
  free: number;
  weapon?: InventoryDocument;
  lvl: number;
  sex: 'm' | 'f';
  lastFight: Date | null;
  inventory?: InventoryDocument[];
  psr: number;
  magics?: Record<string, number>;
  skills?: Record<string, number>;
  passiveSkills?: Record<string, number>;
  bonus: number;
  clan?: Clan;
  penalty: [{
    reason: string;
    date: Date;
  }];
  modifiers?: {
    crit: number,
    agile: number,
    block: number,
    luck: number,
  },
  expLimit: {
    earn: number;
    expiresAt: Date;
  }
  deleted: boolean;
  favoriteMagicList: string[]
}

export type CharModel = Model<Char> & typeof Char

export class Char {
  //
}

const character = new Schema<Char, CharModel>({
  owner: {
    type: String, required: true,
  },
  nickname: {
    type: String, required: true,
  },
  birthday: { type: Date, default: Date.now },
  prof: { type: String, default: 'w' },
  exp: { type: Number, default: 0 },
  harks: {
    type: Object,
    default: {
      str: 0, dex: 0, wis: 0, int: 0, con: 6,
    },
  },
  statistics: {
    type: Object,
    default: {
      games: 0,
      kills: 0,
      death: 0,
      runs: 0,
    },
  },
  gold: { type: Number, default: 100 },
  free: { type: Number, default: 10 },
  weapon: { type: Object, default: {} },
  lvl: { type: Number, default: 1 },
  sex: { type: String, default: 'm' },
  lastFight: { type: Date, default: null },
  inventory: [{ type: Schema.Types.ObjectId, ref: 'Inventory' }],
  psr: { type: Number, default: 1500 },
  magics: { type: Object, default: {} },
  bonus: { type: Number, default: 0 },
  skills: { type: Object, default: {} },
  passiveSkills: { type: Object, default: {} },
  clan: { type: Schema.Types.ObjectId, ref: 'Clan' },
  penalty: [{
    type: new Schema({
      reason: String,
      date: Date,
    }),
  }],
  modifiers: {
    type: Object,
    default: {
      crit: 0,
      agile: 0,
      block: 0,
      luck: 0,
    },
  },
  expLimit: {
    type: new Schema({
      earn: Number,
      expiresAt: Date,
    }),
    default: {
      earn: 0,
      expiresAt: new Date(),
    },
  },
  deleted: { type: Boolean, default: false },
  favoriteMagicList: [{ type: String }],
});

character.loadClass(Char);

export const CharModel = mongoose.model<Char, CharModel>('Character', character);
