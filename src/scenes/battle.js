/**
 * Сцена боя
 * Описание:
 */
const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');
const channelHelper = require('../helpers/channelHelper');
const Char = require('../arena/CharacterService');
const arena = require('../arena');

const battleScene = new Scene('battleScene');
battleScene.enter(({ reply }) => {
  reply(
    'Кнопки',
    Markup.inlineKeyboard([
      Markup.callbackButton('Искать приключений на ...', 'search'),
    ]).resize().extra(),
  );
});

battleScene.action('search', async ({ reply, session }) => {
  // eslint-disable-next-line no-underscore-dangle
  await Char.loading(session.character._id);
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(global.arena));
  // eslint-disable-next-line no-underscore-dangle
  const searchObject = { charId: session.character._id, psr: 1000, startTime: Date.now() };
  arena.mm.push(searchObject);
  await reply('Мессага в личный чат');
  await channelHelper.broadcast('Мессага в общий чат');
});

module.exports = battleScene;
