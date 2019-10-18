/**
 * Сцена боя
 * Описание:
 */
const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');
const game = require('../arena/magics');

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
  // eslint-disable-next-line no-console
  console.log(game);
  reply('Атака');
});

module.exports = battleScene;
