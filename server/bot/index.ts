import { Bot, InlineKeyboard } from 'grammy';
import * as loginHelper from '@/helpers/loginHelper';
import { getInvoice } from '@/api/invoice';
import { createPayment } from '@/api/payment';
import { InvoiceType } from '@fwo/shared';
import { CharacterService } from '@/arena/CharacterService';

const bot = new Bot(process.env.BOT_TOKEN ?? '', {
  client: { environment: process.env.NODE_ENV === 'development' ? 'test' : 'prod' },
});

bot.command('start', async (ctx) => {
  if (!ctx.from || ctx.chat?.type !== 'private') {
    return;
  }

  const character = await loginHelper.getChar(ctx.from.id);
  if (character) {
    const keyboard = new InlineKeyboard().webApp('Открыть', `${process.env.APP_URL}`);
    await ctx.reply(
      `Здравствуй, ${character.nickname}. Вот кнопка, чтобы отправиться в приключение`,
      { reply_markup: keyboard },
    );
  } else {
    const keyboard = new InlineKeyboard().webApp('Создать', `${process.env.APP_URL}`);
    await ctx.reply(
      `Здравствуй, сраный путник. Я вижу ты здесь впервые. 
    Бла бла бла.Вот кнопка, чтобы создать персонажа.`,
      { reply_markup: keyboard },
    );
  }
});

bot.command('help', async (ctx) => {
  if (!ctx.from || ctx.chat?.type !== 'private') {
    return;
  }

  ctx.reply('https://telegra.ph/Fight-Wold-Online-Help-11-05');
});

bot.on('pre_checkout_query', async (ctx) => {
  console.log('pre_checkout_query:: ', ctx.preCheckoutQuery.invoice_payload);
  try {
    await getInvoice(ctx.preCheckoutQuery.invoice_payload);
    await ctx.answerPreCheckoutQuery(true);
  } catch {
    await ctx.answerPreCheckoutQuery(false, { error_message: 'Что-то пошло не так' });
  }
});

bot.on(':successful_payment', async (ctx) => {
  console.log('successful_payment:: ', ctx.message?.successful_payment.invoice_payload);
  const invoice = await getInvoice(ctx.message?.successful_payment.invoice_payload);

  await createPayment({
    invoice,
    amount: ctx.message?.successful_payment.total_amount,
    currency: ctx.message?.successful_payment.currency,
    payload: ctx.message?.successful_payment.invoice_payload,
    user: ctx.from?.id,
  });

  const character = await CharacterService.getCharacter(invoice.user.toString());

  switch (invoice.invoiceType) {
    case InvoiceType.ResetAttributes:
      await character.attributes.resetAttributes({});
  }
});

export const initBot = () => {
  return bot.start();
};

export { bot };
