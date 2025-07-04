import mongoose, { type Model, Schema, type Types } from 'mongoose';

export interface Tower {
  _id: Types.ObjectId;
  id: string;

  players: Types.ObjectId[];
  lvl: number;
  win: boolean;
  ended: boolean;

  createdAt: Date;
  updateAt: Date;
}

export type TowerModel = Model<Tower> & typeof Tower;

export class Tower {
  static async getMaxLvl(this: TowerModel) {
    const [tower] = await this.find({ win: true, ended: true }).sort({ lvl: -1 }).limit(1).exec();

    return tower?.lvl ?? 0;
  }
}

const schema = new Schema<Tower, TowerModel>(
  {
    players: [{ type: Schema.Types.ObjectId, ref: 'Character' }],
    lvl: { type: Schema.Types.Number },
    ended: { type: Schema.Types.Boolean, default: false },
    win: { type: Schema.Types.Boolean, default: false },
  },
  { timestamps: true },
);

schema.loadClass(Tower);

export const TowerModel = mongoose.model<Tower, TowerModel>('Tower', schema);
