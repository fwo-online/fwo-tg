/**
 * Сцена боя
 * Описание:
 */
const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');
const game = require('../arena');

const battleScene = new Scene('battleScene');
battleScene.enter(({ reply }) => {
  reply(
    game.aliveList(),
    Markup.inlineKeyboard([
      Markup.callbackButton('Атака', 'Атака'),
      Markup.callbackButton('Защита', 'Защита'),
      Markup.callbackButton('Магии', 'Магии'),
    ]).resize().extra()
  )
});
