import mongoose, { Schema, Document } from 'mongoose';

export interface Games {
  gameId: number;
  players: string[];
}

export interface GamesDocument extends Games, Document {}

const games = new Schema({
  gameId: {
    type: Number, index: true,
  },
  players: {
    type: Array,
  },
});

const GamesSchema = mongoose.model<GamesDocument>('Games', games);

export default class GamesModel extends GamesSchema {}
