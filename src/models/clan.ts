import mongoose, { Schema, Document } from 'mongoose';
import ValidationError from '../arena/errors/ValidationError';
import type { CharDocument } from './character';

export interface Clan {
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

export interface ClanDocument extends Clan, Document {}

const clanSchema = new Schema({
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

const ClanSchema = mongoose.model<ClanDocument>('Clan', clanSchema);

export default class ClanModel extends ClanSchema {
  static lvlCost = [100, 250, 750, 1500] as const;

  get maxPlayers(): number {
    return this.lvl + 1;
  }

  get hasEmptySlot(): boolean {
    return this.players.length < this.maxPlayers;
  }

  /**
   * Снимает золото из казны и повышает уровань
   * @param {string} clanId
   * @throws {ValidationError}
   */
  async levelUp(): Promise<this> {
    if (this.lvl >= ClanModel.lvlCost.length) {
      throw new ValidationError('Клан имеет максимальный уровень');
    }
    const cost = ClanModel.lvlCost[this.lvl];
    if (this.gold < cost) {
      throw new ValidationError('Недостаточно золота');
    }
    this.gold -= cost;
    this.lvl += 1;
    const updated = await this.save();
    return updated;
  }
}
