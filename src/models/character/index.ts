import mongoose, {
  Schema, Document, Model, Types, PopulatedDoc,
} from 'mongoose';
import type { Profs, Harks } from '@/data';
import type { ClanDocument } from '@/models/clan';
import type { InventoryDocument } from '@/models/inventory';

export interface CharDocument extends Document {
  tgId: number;
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
  lvl: number;
  sex: 'm' | 'f';
  lastFight: Date;
  inventory?: PopulatedDoc<InventoryDocument, Types.ObjectId>[];
  psr: number;
  magics?: Record<string, number>
  skills?: Record<string, number>
  bonus: number;
  clan?: PopulatedDoc<ClanDocument, Types.ObjectId>;
  penalty: [{
    reason: string;
    date: Date;
  }];
  modifiers?: {
    crit: number,
    agile: number,
    block: number,
    luck: number,
  };
  expLimit: {
    earn: number;
    expiresAt: Date;
  };
  deleted: boolean;
  panel?: unknown;
  resists: {
    ice: number;
    fire: number;
    light: number;
    acid: number;
  };
  statical: {
    heal: number;
    mp: number;
    physDef: number;
  }
}

export type CharModel = Model<CharDocument> & typeof CharDocument

export class CharDocument {
  //
}

const character = new Schema<CharDocument, CharModel>({
  tgId: {
    type: Number, required: true,
  },
  nickname: {
    type: String, required: true,
  },
  birthday: { type: Date, default: new Date },
  prof: { type: String, default: 'w' },
  exp: { type: Number, default: 0 },
  harks: {
    type: Schema.Types.Mixed,
    default: {
      str: 0, dex: 0, wis: 0, int: 0, con: 6,
    },
  },
  statistics: {
    type: Schema.Types.Mixed,
    default: {
      games: 0,
      kills: 0,
      death: 0,
      runs: 0,
    },
  },
  gold: { type: Number, default: 100 },
  free: { type: Number, default: 10 },
  lvl: { type: Number, default: 1 },
  sex: { type: String, default: 'm' },
  lastFight: { type: Date },
  inventory: [{ type: Schema.Types.ObjectId, ref: 'Inventory', }],
  psr: { type: Number, default: 1500 },
  magics: { type: Object, default: {} },
  bonus: { type: Number, default: 0 },
  skills: { type: Object, default: {} },
  clan: { type: Schema.Types.ObjectId, ref: 'Clan' },
  penalty: [{
    reason: String,
    date: Date,
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
  panel: { type: Schema.Types.Mixed, default: {} },
  resists: {
    type: Schema.Types.Mixed,
    default: {
      ice: 0,
      fire: 0,
      light: 0,
      acid: 0,
    },
  },
  statical: {
    type: Schema.Types.Mixed,
    default: {
      heal: 0,
      mp: 0,
      physDef: 0,
    },
  },
  expLimit: {
    type: new Schema({
      earn: { type: Number, default: 0 },
      expiresAt: { type: Date, default: new Date },
    }),
    default: {
      earn: 0,
      expiresAt: new Date,
    },
  },
  deleted: { type: Boolean, default: false },
});

character.loadClass(CharDocument);

export const CharModel = mongoose.model<CharDocument, CharModel>('Character', character);
