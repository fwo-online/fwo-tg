import mongoose, { Schema, type Model, type Types } from 'mongoose';

export interface Tower {
  _id: Types.ObjectId;
  id: string;

  players: Types.ObjectId[];
  lvl: number;
  win: boolean;

  createdAt: Date;
  updateAt: Date;
}

export type TowerModel = Model<Tower> & typeof Tower;

export class Tower {
  async getMaxLvl(this: TowerModel) {
    const [tower] = await this.find({ win: true }).sort({ lvl: -1 }).limit(1).exec();

    return tower?.lvl ?? 0;
  }
}

const schema = new Schema<Tower, TowerModel>(
  {
    players: [{ type: Schema.Types.ObjectId, ref: 'Character' }],
    lvl: { type: Schema.Types.Number },
    win: { type: Schema.Types.Boolean, default: false },
  },
  { timestamps: true },
);

schema.loadClass(Tower);

export const TowerModel = mongoose.model<Tower, TowerModel>('Tower', schema);
