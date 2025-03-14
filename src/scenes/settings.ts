import { Scenes, Markup } from 'telegraf';
import type { BotContext } from '../fwo';

export const settingsScene = new Scenes.BaseScene<BotContext>('settings');

settingsScene.enter(async (ctx) => {
  await ctx.replyWithMarkdown('*Настройки*', Markup.keyboard([['🔙 В лобби']]).resize());

  await ctx.reply(
    'Доступные опции',
    Markup.inlineKeyboard([
      [
        Markup.button.callback(
          `Авторегистрация ${ctx.session.character.autoreg ? '✅' : '⬜️'}`,
          'autoreg',
        ),
      ],
    ]),
  );
});

settingsScene.action('autoreg', async (ctx) => {
  ctx.session.character.autoreg = !ctx.session.character.autoreg;

  await ctx.editMessageText(
    'Доступные опции',
    Markup.inlineKeyboard([
      [
        Markup.button.callback(
          `Авторегистрация ${ctx.session.character.autoreg ? '✅' : '⬜️'}`,
          'autoreg',
        ),
      ],
    ]),
  );
});

settingsScene.action('back', async (ctx) => {
  await ctx.editMessageText(
    'Доступные опции',
    Markup.inlineKeyboard([
      [
        Markup.button.callback(
          `Авторегистрация ${ctx.session.character.autoreg ? '✅' : '⬜️'}`,
          'autoreg',
        ),
      ],
    ]),
  );
});

settingsScene.hears('🔙 В лобби', async (ctx) => {
  await ctx.scene.enter('lobby');
});
