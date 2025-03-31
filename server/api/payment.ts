import { bot } from '@/bot';
import { PaymentModel } from '@/models/payment';
import { type InvoiceType, invoiceTypes } from '@fwo/shared';
import type { User } from '@telegram-apps/init-data-node';

export const createInvoice = async (user: User, invoiceType: InvoiceType) => {
  try {
    const orderID = user.id;
    const { amount, title } = invoiceTypes[invoiceType];

    const payment = await PaymentModel.create({
      user: user.id,
      amount,
      orderID,
    });

    const res = await bot.api.createInvoiceLink(
      title,
      'Exclusive Access',
      `${orderID}&&&${payment._id}`,
      '',
      'XTR',
      [{ label: 'Telegram Stars', amount }],
    );

    if (res) {
      console.log(res);
      return res;
    }
    throw new Error('Invoice creation failed.');
  } catch (error) {
    console.error('Error creating invoice:', error.message);
    throw error;
  }
};
