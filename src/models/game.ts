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

const schema = new Schema<GameDocument, GameModel>({
  gameId: {
    type: Number, index: true,
  },
  players: {
    type: Array,
  },
});

schema.loadClass(GameDocument);

export const GameModel = mongoose.model<GameDocument, GameModel>('Games', schema);
