import type { InvoiceType } from '@fwo/shared';
import mongoose, { Schema, type Model, type Types } from 'mongoose';

export interface Invoice {
  _id: Types.ObjectId;
  id: string;

  user: number;
  amount: number;
  invoiceType: InvoiceType;
  payload: string;
  createdAt: string;
}

export type InvoiceModel = Model<Invoice> & typeof Invoice;

export class Invoice {
  //
}

const schema = new Schema<Invoice, InvoiceModel>(
  {
    user: { type: Number },
    amount: { type: Number },
    invoiceType: { type: String },
    payload: { type: String },
  },
  { timestamps: true },
);

schema.loadClass(Invoice);

export const InvoiceModel = mongoose.model<Invoice, InvoiceModel>('Invoice', schema);
