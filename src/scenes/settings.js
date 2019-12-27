const Scene = require('telegraf/scenes/base');
const Stage = require('telegraf/stage');
const Markup = require('telegraf/markup');

const {
  leave,
} = Stage;
const settingsScene = new Scene('settings');
const loginHelper = require('../helpers/loginHelper');

settingsScene.enter(async ({ replyWithMarkdown, reply }) => {
  await replyWithMarkdown(
    '*Настройки*',
    Markup.keyboard([
      ['🔙 В лобби'],
    ]).resize().extra(),
  );

  await reply(
    'Доступные опции',
    Markup.inlineKeyboard([
      [Markup.callbackButton(
        'Удалить персонажа',
        'remove',
      )],
    ]).resize().extra(),
  );
});


settingsScene.action('remove', async ({
  session,
  scene,
  answerCbQuery,
  from,
}) => {
  const resp = await loginHelper.remove(from.id);
  session.character = null;
  if (resp) {
    answerCbQuery('Твой персонаж был удалён!');
    scene.enter('greeter');
  } else {
    answerCbQuery('Произошла ошибка');
    scene.enter('greeter');
  }
});

settingsScene.hears('🔙 В лобби', ({ scene }) => {
  scene.enter('lobby');
});

module.exports = settingsScene;
