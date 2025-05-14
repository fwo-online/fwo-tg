import mongoose, { Schema, type Model, type Types } from 'mongoose';
import type { Char } from './character';

export interface Clan {
  _id: Types.ObjectId;
  id: string;

  name: string;
  logo: {
    moderated: boolean;
    type: string;
    data: Buffer;
  };
  gold: number;
  lvl: number;
  owner: Char;
  players: Char[];
  requests: Char[];
  forge: {
    lvl: number;
    openedAt?: Date;
    expiresAt?: Date;
  };
}

export type ClanModel = Model<Clan> & typeof Clan;

export class Clan {
  get maxPlayers(): number {
    return this.lvl + 1;
  }

  get hasEmptySlot(): boolean {
    return this.players.length < this.maxPlayers;
  }

  get isForgeActive(): boolean {
    return Boolean(this.forge?.expiresAt && new Date() < this.forge.expiresAt);
  }
}

const schema = new Schema<Clan>({
  name: { type: String, required: true, unique: true },
  logo: {
    moderated: {
      type: Boolean,
      default: false,
    },
    type: String,
    data: Buffer,
  },
  gold: { type: Number, default: 0 },
  lvl: { type: Number, default: 1 },
  requests: [{ type: Schema.Types.ObjectId, ref: 'Character' }],
  players: [{ type: Schema.Types.ObjectId, ref: 'Character' }],
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    required: true,
    unique: true,
  },
  forge: {
    lvl: { type: Number, default: 1 },
    openedAt: { type: Date },
    expiresAt: { type: Date },
  },
});

schema.loadClass(Clan);

export const ClanModel = mongoose.model<Clan, ClanModel>('Clan', schema);
