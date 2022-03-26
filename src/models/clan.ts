import mongoose, {
  Schema, Document, Model, Types, LeanDocument,
} from 'mongoose';
import type { CharDocument } from './character';

export interface ClanDocument extends Document<string> {
  name: string;
  logo: {
    moderated: boolean;
    type: string;
    data: Buffer;
  },
  gold: number;
  lvl: number;
  owner: CharDocument;
  players: Types.DocumentArray<CharDocument>;
  requests: Types.DocumentArray<CharDocument>;
}

type ClanModel = Model<ClanDocument> & typeof ClanDocument

export class ClanDocument {
  get maxPlayers(): number {
    return this.lvl + 1;
  }

  get hasEmptySlot(): boolean {
    return this.players.length < this.maxPlayers;
  }
}

export type Clan = LeanDocument<ClanDocument>;

const schema = new Schema<ClanDocument>({
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

schema.loadClass(ClanDocument);

export const ClanModel = mongoose.model<ClanDocument, ClanModel>('Clan', schema);
