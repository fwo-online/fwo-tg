import { type Payment, PaymentModel } from '@/models/payment';

export const createPayment = async (payment: Partial<Payment>) => {
  await PaymentModel.create(payment);
};
