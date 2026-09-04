import type {
  CharacterAttributes,
  CharacterClass,
  Contract,
  ItemComponent,
  ItemWear,
} from '@fwo/shared';
import mongoose, { type Model, Schema, type Types } from 'mongoose';
import type { Clan } from '@/models/clan';
import type { Item } from '@/models/item';

export interface Char {
  _id: Types.ObjectId;
  id: string;

  owner: string;
  nickname: string;
  birthday: Date;
  prof: CharacterClass;
  exp: number;
  harks: CharacterAttributes;
  statistics: {
    games: number;
    kills: number;
    death: number;
    runs: number;
    wins: number;
    damage: number;
    heal: number;
    forestEvents?: number;
    towerFloors?: number;
    itemsCrafted?: number;
    bossDamage?: number;
  };
  gold: number;
  free: number;
  sex: 'm' | 'f';
  lastFight: Date | null;
  lastTower: Date | null;
  lastForest: Date | null;
  psr: number;
  magics: Record<string, number>;
  branches: string[];
  subclass?: string;
  skills: Record<string, number>;
  passiveSkills: Record<string, number>;
  bonus: number;
  clan?: Clan;
  penalty: {
    reason: string;
    date: Date;
  }[];
  modifiers?: {
    crit: number;
    agile: number;
    block: number;
    luck: number;
  };
  expLimit?: {
    earn: number;
    expiresAt: Date;
  };
  deleted: boolean;
  active: boolean;
  items: Item[];
  equipment: Map<ItemWear, Item>;
  components: Map<ItemComponent, number>;
  towerAvailable: boolean;
  notificationSettings?: {
    gameStart: boolean;
    gameEnd: boolean;
    afkWarning: boolean;
    dailyRewards: boolean;
    levelUp: boolean;
  };
  contracts: Contract[];
  contractsGeneratedAt: Date | null;
  activeTitle?: string;
  unlockedTitles: string[];
  claimedAchievements: string[];
  vigor?: {
    energy: number;
    lastResetDate: Date;
  };
}

export type CharModel = Model<Char> & typeof Char;

export class Char {
  //
}

const character = new Schema<Char, CharModel>({
  owner: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    required: true,
  },
  birthday: { type: Date, default: Date.now },
  prof: { type: String, required: true },
  exp: { type: Number, default: 0 },
  harks: {
    type: Object,
    default: {
      str: 0,
      dex: 0,
      wis: 0,
      int: 0,
      con: 6,
    },
  },
  statistics: {
    type: Object,
    default: {
      games: 0,
      kills: 0,
      death: 0,
      runs: 0,
      wins: 0,
      damage: 0,
      heal: 0,
    },
  },
  gold: { type: Number, default: 100 },
  free: { type: Number, default: 10 },
  sex: { type: String, default: 'm' },
  lastFight: { type: Date, default: null },
  psr: { type: Number, default: 0 },
  magics: { type: Object, default: {} },
  branches: { type: [String], default: [] },
  subclass: { type: String, default: null },
  bonus: { type: Number, default: 0 },
  skills: { type: Object, default: {} },
  passiveSkills: { type: Object, default: {} },
  clan: { type: Schema.Types.ObjectId, ref: 'Clan' },
  penalty: [
    {
      type: new Schema({
        reason: String,
        date: Date,
      }),
    },
  ],
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
  items: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
  equipment: {
    type: Schema.Types.Map,
    of: { type: Schema.Types.ObjectId, ref: 'Item' },
    default: {},
  },
  deleted: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  favoriteMagicList: [{ type: String }],
  components: {
    type: Schema.Types.Map,
    of: Number,
    default: {},
  },
  lastTower: { type: Schema.Types.Date, default: null },
  towerAvailable: { type: Schema.Types.Boolean, default: true },
  notificationSettings: {
    type: Object,
    default: {
      gameStart: true,
      gameEnd: false,
      afkWarning: false,
      dailyRewards: false,
      levelUp: false,
    },
  },
  lastForest: { type: Schema.Types.Date, default: null },
  contracts: {
    type: [
      new Schema(
        {
          type: { type: String, required: true },
          tier: { type: Number, required: true },
          goal: { type: Number, required: true },
          progress: { type: Number, default: 0 },
          claimed: { type: Boolean, default: false },
          exp: { type: Number, required: true },
          gold: { type: Number, required: true },
          components: { type: Schema.Types.Map, of: Number, default: {} },
        },
        { _id: false },
      ),
    ],
    default: [],
  },
  contractsGeneratedAt: { type: Schema.Types.Date, default: null },
  activeTitle: { type: String, default: null },
  unlockedTitles: { type: [String], default: [] },
  claimedAchievements: { type: [String], default: [] },
  vigor: {
    type: new Schema(
      {
        energy: { type: Number, default: 100 },
        lastResetDate: { type: Schema.Types.Date, default: Date.now },
      },
      { _id: false },
    ),
    default: () => ({ energy: 100, lastResetDate: new Date() }),
  },
});

character.loadClass(Char);

export const CharModel = mongoose.model<Char, CharModel>('Character', character);
