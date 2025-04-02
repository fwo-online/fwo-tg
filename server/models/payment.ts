import type { Invoice } from '@/models/invoice';
import mongoose, { Schema, type Model, type Types } from 'mongoose';

export interface Payment {
  _id: Types.ObjectId;
  id: string;

  invoice: Invoice;
  user: number;
  amount: number;
  currency: string;
  payload: string;
}

export type PaymentModel = Model<Payment> & typeof Payment;

export class Payment {
  //
}

const schema = new Schema<Payment, PaymentModel>({
  invoice: { type: Schema.Types.ObjectId, ref: 'Invoice' },
  currency: { type: String },
  amount: { type: Number },
  payload: { type: String },
});

schema.loadClass(Payment);

export const PaymentModel = mongoose.model<Payment, PaymentModel>('Payment', schema);
