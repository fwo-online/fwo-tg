import mongoose, { Schema, Model, Types } from 'mongoose';

export interface Game {
  _id: Types.ObjectId
  id: string

  gameId: number;
  players: string[];
}

export type GameModel = Model<Game> & typeof Game

export class Game {
  //
}

const schema = new Schema<Game, GameModel>({
  gameId: {
    type: Number, index: true,
  },
  players: {
    type: [String],
  },
});

schema.loadClass(Game);

export const GameModel = mongoose.model<Game, GameModel>('Games', schema);
