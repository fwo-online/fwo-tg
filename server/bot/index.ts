import { chatMiddleware } from '@/middlewares';
import { Bot, InlineKeyboard } from 'grammy';
import * as loginHelper from '@/helpers/loginHelper';
import { createPreOrder } from '@/api/preOrder';

const bot = new Bot(process.env.BOT_TOKEN ?? '', {
  client: { environment: process.env.NODE_ENV === 'development' ? 'test' : 'prod' },
});

bot.use(chatMiddleware);

bot.command('start', async (ctx) => {
  if (!ctx.from) {
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
  ctx.reply('https://telegra.ph/Fight-Wold-Online-Help-11-05');
});

bot.on('pre_checkout_query', async (ctx) => {
  console.log('pre_checkout_query:: ', ctx.preCheckoutQuery);
  try {
    await createPreOrder({
      orderID: ctx.preCheckoutQuery.id,
      amount: ctx.preCheckoutQuery.total_amount,
      currency: ctx.preCheckoutQuery.currency,
      user: ctx.preCheckoutQuery.from.id,
      payload: ctx.preCheckoutQuery.invoice_payload,
    });

    await ctx.answerPreCheckoutQuery(true);
  } catch {
    await ctx.answerPreCheckoutQuery(false, { error_message: 'Что-то пошло не так' });
  }
});

export const initBot = () => {
  return bot.start();
};

export { bot };
