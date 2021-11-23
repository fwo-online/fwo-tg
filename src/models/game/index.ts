import mongoose, {
  Schema, Document, Model, Types
} from 'mongoose';

export interface GameDocument extends Document {
  gameId: number;
  players: Types.Array<string>;
}

export type GameModel = Model<GameDocument> & typeof GameDocument

export class GameDocument {
  //
}

const game = new Schema<GameDocument, GameModel>({
  gameId: {
    type: Number, index: true,
  },
  players: {
    type: [Schema.Types.String]
  },
});

game.loadClass(GameDocument);

export const GameModel = mongoose.model<GameDocument, GameModel>('Games', game);
