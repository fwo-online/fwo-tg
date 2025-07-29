import mongoose, { type Model, Schema, type Types } from 'mongoose';

export interface Forest {
  _id: Types.ObjectId;
  id: string;

  player: Types.ObjectId;
  events: number;

  createdAt: Date;
  updateAt: Date;
}

export type ForestModel = Model<Forest> & typeof Forest;

export class Forest {
  //
}

const schema = new Schema<Forest, ForestModel>(
  {
    player: { type: Schema.Types.ObjectId, ref: 'Character' },
    events: { type: Schema.Types.Number },
  },
  { timestamps: true },
);

schema.loadClass(Forest);

export const ForestModel = mongoose.model<Forest, ForestModel>('Forest', schema);
