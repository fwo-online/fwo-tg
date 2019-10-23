/**
 * Сцена боя
 * Описание:
 */
const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');
const channelHelper = require('../helpers/channelHelper');

const battleScene = new Scene('battleScene');
battleScene.enter(({ reply }) => {
  reply(
    'Кнопки',
    Markup.inlineKeyboard([
      Markup.callbackButton('Атака', 'Атака'),
      Markup.callbackButton('Защита', 'Защита'),
      Markup.callbackButton('Магии', 'Магии'),
    ]).resize().extra(),
  );
});

battleScene.action('Атака', ({ reply }) => {
  reply('Сообщение в личный чат');
  channelHelper.broadcast('Сообщение в общий чат');
});

module.exports = battleScene;
