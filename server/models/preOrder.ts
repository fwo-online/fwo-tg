import mongoose, { Schema, type Model, type Types } from 'mongoose';

export interface PreOrder {
  _id: Types.ObjectId;
  id: string;

  user: number;
  amount: number;
  orderID: string;
  currency: string;
  orderInfo: string;
  payload: string;
}

export type PreOrderModel = Model<PreOrder> & typeof PreOrder;

export class PreOrder {
  //
}

const schema = new Schema<PreOrder, PreOrderModel>({
  user: { type: Number },
  amount: { type: Number },
  orderID: { type: String },
  currency: { type: String },
  orderInfo: { type: String },
  payload: { type: String },
});

schema.loadClass(PreOrder);

export const PreOrderModel = mongoose.model<PreOrder, PreOrderModel>('PreOrder', schema);
