/**
 * Сцена боя
 * Описание:
 */
const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');
const game = require('../arena');

const battleScene = new Scene('battleScene');
battleScene.enter(({ reply }) => {
  reply(game.aliveList(),
    Markup.keyboard(['Атака', 'Защита', 'Магии']).oneTime().resize().extra());
});
