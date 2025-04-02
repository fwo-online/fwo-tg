import { type Payment, PaymentModel } from '@/models/payment';
import type { FilterQuery } from 'mongoose';

export const createPayment = async (payment: Partial<Payment>) => {
  await PaymentModel.create(payment);
};

export const getPayments = async (query: FilterQuery<Payment>) => {
  return PaymentModel.find(query);
};
