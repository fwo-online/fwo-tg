import { Scenes, Markup } from 'telegraf';
import type { BotContext } from '../fwo';
import * as loginHelper from '../helpers/loginHelper';

export const settingsScene = new Scenes.BaseScene<BotContext>('settings');

settingsScene.enter(async (ctx) => {
  await ctx.replyWithMarkdown(
    '*Настройки*',
    Markup.keyboard([
      ['🔙 В лобби'],
    ]).resize(),
  );

  await ctx.reply(
    'Доступные опции',
    Markup.inlineKeyboard([
      [Markup.button.callback(
        'Удалить персонажа',
        'removeConfirm',
      )],
      [Markup.button.callback(
        `Авторегистрация ${ctx.session.character.autoreg ? '✅' : '⬜️'}`,
        'autoreg',
      )],
    ]),
  );
});

settingsScene.action('autoreg', async (ctx) => {
  ctx.session.character.autoreg = !ctx.session.character.autoreg;

  await ctx.editMessageText(
    'Доступные опции',
    Markup.inlineKeyboard([
      [Markup.button.callback(
        'Удалить персонажа',
        'removeConfirm',
      )],
      [Markup.button.callback(
        `Авторегистрация ${ctx.session.character.autoreg ? '✅' : '⬜️'}`,
        'autoreg',
      )],
    ]),
  );
});

settingsScene.action('removeConfirm', async (ctx) => {
  await ctx.editMessageText(
    'Вы действительно хотите удалить персонажа?',
    Markup.inlineKeyboard([
      Markup.button.callback('Да', 'remove'),
      Markup.button.callback('Нет', 'back'),
    ]),
  );
});

settingsScene.action('remove', async (ctx) => {
  const resp = await loginHelper.remove(ctx.from?.id);
  // @ts-expect-error todo
  ctx.session.character = null;
  if (resp) {
    await ctx.answerCbQuery('Твой персонаж был удалён!');
    await ctx.scene.enter('greeter');
  } else {
    await ctx.answerCbQuery('Произошла ошибка');
    await ctx.scene.enter('greeter');
  }
});

settingsScene.action('back', async (ctx) => {
  await ctx.editMessageText(
    'Доступные опции',
    Markup.inlineKeyboard([
      [Markup.button.callback(
        'Удалить персонажа',
        'removeConfirm',
      )],
      [Markup.button.callback(
        `Авторегистрация ${ctx.session.character.autoreg ? '✅' : '⬜️'}`,
        'autoreg',
      )],
    ]),
  );
});

settingsScene.hears('🔙 В лобби', async (ctx) => {
  await ctx.scene.enter('lobby');
});
