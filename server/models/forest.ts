import { ForestEventType, ForestState } from '@fwo/shared';
import mongoose, { type Model, Schema, type Types } from 'mongoose';

export interface ForestEventData {
  type: ForestEventType;
  createdAt: Date;
  expiresAt: Date;
  resolved: boolean;
  action?: string; // Действие игрока
  result?: string; // Результат события
}

export interface Forest {
  _id: Types.ObjectId;
  id: string;

  player: Types.ObjectId; // ID игрока
  state: ForestState;
  ended: boolean;

  // Статус игрока
  playerHP: number; // Текущее HP игрока
  playerMaxHP: number; // Максимальное HP

  // События
  events: ForestEventData[]; // История событий
  currentEvent?: ForestEventData; // Текущее событие

  // Время
  startedAt: Date;
  timeInForest: number; // Время в лесу в миллисекундах
  lastEventAt?: Date; // Когда было последнее событие

  // Статистика
  eventsEncountered: number; // Количество встреченных событий
  battlesWon: number;
  resourcesGathered: Record<string, number>; // Собранные ресурсы

  createdAt: Date;
  updatedAt: Date;
}

export type ForestModel = Model<Forest> & typeof Forest;

export class Forest {
  // Можно добавить статические методы, если понадобятся
  static async getActiveForest(this: ForestModel, playerId: Types.ObjectId) {
    return this.findOne({ player: playerId, ended: false }).exec();
  }

  static async endActiveForest(this: ForestModel, playerId: Types.ObjectId) {
    return this.updateOne({ player: playerId, ended: false }, { ended: true, state: 'finished' }).exec();
  }
}

const forestEventDataSchema = new Schema<ForestEventData>({
  type: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  resolved: { type: Boolean, default: false },
  action: { type: String },
  result: { type: String },
});

const schema = new Schema<Forest, ForestModel>(
  {
    player: { type: Schema.Types.ObjectId, ref: 'Character', required: true },
    state: { type: String, default: ForestState.Waiting },
    ended: { type: Boolean, default: false },

    playerHP: { type: Number, required: true },
    playerMaxHP: { type: Number, required: true },

    events: [forestEventDataSchema],
    currentEvent: { type: forestEventDataSchema, default: undefined },

    startedAt: { type: Date, default: Date.now },
    timeInForest: { type: Number, default: 0 },
    lastEventAt: { type: Date },

    eventsEncountered: { type: Number, default: 0 },
    battlesWon: { type: Number, default: 0 },
    resourcesGathered: { type: Object, default: {} },
  },
  { timestamps: true },
);

schema.loadClass(Forest);

export const ForestModel = mongoose.model<Forest, ForestModel>('Forest', schema);
