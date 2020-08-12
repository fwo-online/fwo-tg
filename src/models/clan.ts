import mongoose, { Schema, Document } from 'mongoose';
import type { CharDocument } from './character';

export interface ClanDB {
  name: string;
  logo: {
    moderated: boolean;
    type: string;
    data: Buffer;
  },
  gold: number;
  lvl: number;
  owner: CharDocument;
  players: CharDocument[];
  requests: CharDocument[];
}

export interface ClanDocument extends ClanDB, Document {}

const clan = new Schema({
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
});

const ClanSchema = mongoose.model<ClanDocument>('Clan', clan);

export default class ClanModel extends ClanSchema {
  get maxPlayers(): number {
    return this.lvl + 1;
  }

  get hasEmptySlot(): boolean {
    return this.players.length < this.maxPlayers;
  }
}
