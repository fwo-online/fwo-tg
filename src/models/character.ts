import mongoose, {
  Schema, Document, Model, DocumentDefinition,
} from 'mongoose';
import type { Profs, Harks } from '../data';
import type { ClanDocument } from './clan';
import type { InventoryDocument } from './inventory';
// import type { Hark } from '../data/harks';

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
  weapon?: InventoryDocument;
  lvl: number;
  sex: 'm' | 'f';
  lastFight: Date;
  inventory?: InventoryDocument[];
  psr: number;
  magics?: Record<string, number>
  skills?: Record<string, number>
  bonus: number;
  clan?: ClanDocument;
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
}

export type CharModel = Model<CharDocument> & typeof CharDocument

export class CharDocument {
  //
}

export type Char = DocumentDefinition<CharDocument>

const character = new Schema<CharDocument, CharModel>({
  tgId: {
    type: Number, required: true,
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
  panel: { type: Object, default: {} },
  resists: {
    type: Object,
    default: {
      ice: 0,
      fire: 0,
      light: 0,
      acid: 0,
    },
  },
  statical: {
    type: Object,
    default: {
      heal: 0,
      mp: 0,
      physDef: 0,
    },
  },
  expLimit: {
    type: new Schema({
      earn: { type: Number, default: 0 },
      expiresAt: { type: Date, default: Date.now },
    }),
    default: {
      earn: 0,
      expiresAt: Date.now(),
    },
  },
  deleted: { type: Boolean, default: false },
});

character.loadClass(CharDocument);

export const CharModel = mongoose.model<CharDocument, CharModel>('Character', character);
