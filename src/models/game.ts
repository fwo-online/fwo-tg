import mongoose, {
  Schema, Document, DocumentDefinition, Model,
} from 'mongoose';

export interface GameDocument extends Document {
  gameId: number;
  players: string[];
}

export type GameModel = Model<GameDocument> & typeof GameDocument

export class GameDocument {
  //
}

export type Game = DocumentDefinition<GameDocument>

const game = new Schema({
  gameId: {
    type: Number, index: true,
  },
  players: {
    type: Array,
  },
});

game.loadClass(GameDocument);

export const GameModel = mongoose.model<GameDocument, GameModel>('Games', game);
