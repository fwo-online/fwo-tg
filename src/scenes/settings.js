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
  reply,
  from,
}) => {
  const resp = await loginHelper.remove(from.id);
  session.character = null;
  if (resp) {
    reply(
      'Твой персонаж был удалён!',
    );
    leave();
    scene.enter('greeter');
  } else {
    reply(
      'Произошла ошибка',
    );
    leave();
    scene.enter('greeter');
  }
});

settingsScene.hears('🔙 В лобби', ({ scene }) => {
  leave();
  scene.enter('lobby');
});

module.exports = settingsScene;
