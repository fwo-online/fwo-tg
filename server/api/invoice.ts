import { bot } from '@/bot';
import { InvoiceModel } from '@/models/invoice';
import { type InvoiceType, invoiceTypes } from '@fwo/shared';
import type { User } from '@telegram-apps/init-data-node';

export const createInvoice = async (user: User, invoiceType: InvoiceType) => {
  try {
    const { stars, title, desctiption } = invoiceTypes[invoiceType];

    const invoice = await InvoiceModel.create({
      user: user.id,
      amount: stars,
      invoiceType,
    });

    const res = await bot.api.createInvoiceLink(title, desctiption, invoice.id, '', 'XTR', [
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
