import type { CharacterClass, PlayerPerformance } from '@fwo/shared';
import mongoose, { Schema, type Model, type Types } from 'mongoose';

export interface Ladder extends PlayerPerformance {
  _id: Types.ObjectId;
  id: string;

  player: Types.ObjectId;
  prof: CharacterClass;

  rounds: number;
  psr: number;
}

export type LadderModel = Model<Ladder> & typeof Ladder;

export class Ladder {
  static async averagePerfomance(this: LadderModel, psr: number, prof: CharacterClass) {
    return this.aggregate([
      { $match: { psr: { $gte: psr - 100, $lte: psr + 100 }, prof } },
      {
        $group: {
          _id: null,
          avgDamage: { $avg: '$damage' },
          avgHeal: { $avg: '$heal' },
          avgKills: { $avg: '$kills' },
          avgRounds: { $avg: '$rounds' },
        },
      },
    ]).then((result) => {
      const avgRounds = result[0]?.avgRounds ?? 1;
      return {
        avgKills: result[0]?.avgKills ?? 0,
        avgDamage: result[0]?.avgDamage ?? 0,
        avgHeal: result[0]?.avgHeal ?? 0,
        avgDamagePerRound: (result[0]?.avgDamage ?? 0) / avgRounds,
        avgHealPerRound: (result[0]?.avgHeal ?? 0) / avgRounds,
        avgKillsPerRound: (result[0]?.avgKills ?? 0) / avgRounds,
      };
    });
  }
}

const schema = new Schema<Ladder, LadderModel>(
  {
    player: { type: Schema.Types.ObjectId, ref: 'Character' },
    prof: { type: String },
    psr: { type: Number },
    winner: { type: Boolean },
    alive: { type: Boolean },
    kills: { type: Number },
    damage: { type: Number },
    heal: { type: Number },
    rounds: { type: Number },
  },
  { timestamps: true },
);

schema.loadClass(Ladder);

export const LadderModel = mongoose.model<Ladder, LadderModel>('Ladder', schema);
