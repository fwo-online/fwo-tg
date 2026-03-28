import mongoose, { Schema, type Model, type Types } from 'mongoose';
import { CounterModel } from '@/models/counter';

export interface Game {
  _id: Types.ObjectId;
  id: string;

  gameId: number;
  players: string[];
}

export type GameModel = Model<Game> & typeof Game;

export class Game {
  //
}

const schema = new Schema<Game, GameModel>({
  gameId: {
    type: Number,
    index: true,
  },
  players: {
    type: [String],
  },
});

schema.pre('save', async function () {
  if (this.isNew) {
    const counter = await CounterModel.findOneAndUpdate(
      { type: 'game' },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' },
    );

    this.gameId = counter.seq;
  }
});

schema.loadClass(Game);

export const GameModel = mongoose.model<Game, GameModel>('Games', schema);
