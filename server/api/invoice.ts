import { bot } from '@/bot';
import { InvoiceModel } from '@/models/invoice';
import { type InvoiceType, invoiceTypes } from '@fwo/shared';
import type { User } from '@telegram-apps/init-data-node';

export const createInvoice = async (user: User, invoiceType: InvoiceType, payload?: string) => {
  try {
    const { stars, title } = invoiceTypes[invoiceType];

    const invoice = await InvoiceModel.create({
      user: user.id,
      amount: stars,
      invoiceType,
      payload: payload ?? title,
    });

    const res = await bot.api.createInvoiceLink(title, payload ?? title, invoice.id, '', 'XTR', [
      { label: 'Telegram Stars', amount: stars },
    ]);

    if (res) {
      console.log(res);
      return res;
    }
    throw new Error('Invoice creation failed.');
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

export const getInvoice = (id?: string) => {
  return InvoiceModel.findById(id).orFail(new Error('Invoice not found'));
};
