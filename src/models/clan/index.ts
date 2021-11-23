import mongoose, {
  Schema, Document, Model, Types, PopulatedDoc,
} from 'mongoose';
import ValidationError from '@/arena/errors/ValidationError';
import type { CharDocument } from '@/models/character';

export interface ClanDocument extends Document {
  name: string;
  logo: {
    moderated: boolean;
    type: string;
    data: Buffer;
  },
  gold: number;
  lvl: number;
  owner: PopulatedDoc<CharDocument, Types.ObjectId>;
  players: PopulatedDoc<CharDocument, Types.ObjectId>[];
  requests: PopulatedDoc<CharDocument, Types.ObjectId>[];
}

type ClanModel = Model<ClanDocument> & typeof ClanDocument;

export class ClanDocument {
  static lvlCost(): number[] {
    return [100, 250, 750, 1500];
  }

  get maxPlayers(): number {
    return this.lvl + 1;
  }

  get hasEmptySlot(): boolean {
    return this.players.length < this.maxPlayers;
  }

  /**
   * Снимает золото из казны и повышает уровень
   * @param clanId
   * @throws {ValidationError}
   */
  async levelUp(): Promise<this> {
    if (this.lvl >= ClanModel.lvlCost().length) {
      throw new ValidationError('Клан имеет максимальный уровень');
    }
    const cost = ClanModel.lvlCost()[this.lvl];
    if (this.gold < cost) {
      throw new ValidationError('Недостаточно золота');
    }
    this.gold -= cost;
    this.lvl += 1;
    const updated = await this.save();
    return updated;
  }
}

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
