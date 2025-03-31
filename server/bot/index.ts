import { chatMiddleware } from '@/middlewares';
import { Bot, InlineKeyboard } from 'grammy';
import * as loginHelper from '@/helpers/loginHelper';

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

export const initBot = () => {
  return bot.start();
};

export { bot };
