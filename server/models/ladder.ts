import type { PlayerPerfomance } from '@fwo/shared';
import mongoose, { Schema, type Model, type Types } from 'mongoose';

export interface Ladder extends PlayerPerfomance {
  _id: Types.ObjectId;
  id: string;

  player: Types.ObjectId;

  psr: number;
}

export type LadderModel = Model<Ladder> & typeof Ladder;

export class Ladder {
  static async averagePerfomance(this: LadderModel, psr: number) {
    return this.aggregate([
      { $match: { psr: { $gte: psr - 100, $lte: psr + 100 } } },
      {
        $group: {
          _id: null,
          avgDamage: { $avg: '$damage' },
          avgHeal: { $avg: '$heal' },
          avgKills: { $avg: '$kills' },
        },
      },
    ]).then((result) => ({
      kills: result[0]?.avgKills ?? 0,
      damage: result[0]?.avgDamage ?? 0,
      heal: result[0]?.avgHeal ?? 0,
    }));
  }
}

const schema = new Schema<Ladder, LadderModel>({
  player: { type: Schema.Types.ObjectId, ref: 'Character' },
  psr: { type: Number },
  winner: { type: Boolean },
  alive: { type: Boolean },
  kills: { type: Number },
  damage: { type: Number },
  heal: { type: Number },
});

schema.loadClass(Ladder);

export const LadderModel = mongoose.model<Ladder, LadderModel>('Ladder', schema);
