import mongoose, { Schema, type Model, type Types } from 'mongoose';

export interface MarketItem {
  _id: Types.ObjectId;
  id: string;

  seller: Types.ObjectId;
  item: Types.ObjectId;
  price: number;
  sold: boolean;
  createdAt: string;
}

export type MarketItemModel = Model<MarketItem> & typeof MarketItem;

export class MarketItem {
  //
}

const schema = new Schema<MarketItem, MarketItemModel>(
  {
    seller: { type: Schema.Types.ObjectId, ref: 'Character', required: true },
    item: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    price: { type: Number, required: true },
    sold: { type: Boolean, default: false },
  },
  { timestamps: true },
);

schema.loadClass(MarketItem);

export const MarketItemModel = mongoose.model<MarketItem, MarketItemModel>('MarketItem', schema);
