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
        `autoreg_${ctx.session.character.id}`,
      )],
    ]),
  );
});

settingsScene.action(/autoreg/, (ctx) => {
  ctx.session.character.autoreg = !ctx.session.character.autoreg;

  ctx.editMessageText(
    'Доступные опции',
    Markup.inlineKeyboard([
      [Markup.button.callback(
        'Удалить персонажа',
        'remove',
      )],
      [Markup.button.callback(
        `Авторегистрация ${ctx.session.character.autoreg ? '✅' : '⬜️'}`,
        'autoreg',
      )],
    ]),
  );
});

settingsScene.action('removeConfirm', (ctx) => {
  ctx.editMessageText(
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
    ctx.answerCbQuery('Твой персонаж был удалён!');
    ctx.scene.enter('greeter');
  } else {
    ctx.answerCbQuery('Произошла ошибка');
    ctx.scene.enter('greeter');
  }
});

settingsScene.action('back', async (ctx) => {
  ctx.editMessageText(
    'Доступные опции',
    Markup.inlineKeyboard([
      [Markup.button.callback(
        'Удалить персонажа',
        'removeConfirm',
      )],
      [Markup.button.callback(
        `Авторегистрация ${ctx.session.character.autoreg ? '✅' : '⬜️'}`,
        `autoreg_${ctx.session.character.id}`,
      )],
    ]),
  );
});

settingsScene.hears('🔙 В лобби', (ctx) => {
  ctx.scene.enter('lobby');
});
