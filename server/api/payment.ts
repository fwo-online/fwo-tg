import type { Invoice } from '@/models/invoice';
import { type Payment, PaymentModel } from '@/models/payment';
import type { InvoiceType } from '@fwo/shared';
import type { FilterQuery } from 'mongoose';

export const createPayment = async (payment: Partial<Payment>) => {
  await PaymentModel.create(payment);
};

export const getPaymentsByInvoiceType = async (
  query: FilterQuery<Payment>,
  invoiceType: InvoiceType,
) => {
  const payments = await PaymentModel.find(query)
    .populate<{ invoice: Invoice }>({
      path: 'invoice',
      match: { invoiceType },
    })
    .exec();

  return payments.filter(({ invoice }) => Boolean(invoice));
};
