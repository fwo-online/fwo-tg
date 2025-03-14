import { Markup, Scenes } from 'telegraf';
import type { BotContext } from '../fwo';
import * as loginHelper from '@/helpers/loginHelper';

export const greeter = new Scenes.BaseScene<BotContext>('greeter');

greeter.enter(async (ctx) => {
  if (!ctx.from) {
    return;
  }

  const character = await loginHelper.getChar(ctx.from.id);
  if (character) {
    await ctx.reply(
      `Здравствуй, ${character.nickname}. Вот кнопка, чтобы отправиться в приключение`,
      Markup.inlineKeyboard([Markup.button.webApp('Открыть', `${process.env.APP_URL}`)]),
    );
  } else {
    await ctx.reply(
      `Здравствуй, сраный путник. Я вижу ты здесь впервые. 
    Бла бла бла.Вот кнопка, чтобы создать персонажа.`,
      Markup.inlineKeyboard([Markup.button.webApp('Создать', `${process.env.APP_URL}`)]),
    );
  }
});
