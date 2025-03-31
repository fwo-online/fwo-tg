import mongoose, { Schema, type Model, type Types } from 'mongoose';

export interface Payment {
  _id: Types.ObjectId;
  id: string;

  user: number;
  amount: number;
  orderID: string;
}

export type PaymentModel = Model<Payment> & typeof Payment;

export class Payment {
  //
}

const schema = new Schema<Payment, PaymentModel>({
  user: { type: Number },
  amount: { type: Number },
  orderID: { type: String },
});

schema.loadClass(Payment);

export const PaymentModel = mongoose.model<Payment, PaymentModel>('Payment', schema);
