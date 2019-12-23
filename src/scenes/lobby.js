const Scene = require('telegraf/scenes/base');
const Stage = require('telegraf/stage');
const Markup = require('telegraf/markup');
const { charDescr } = require('../arena/MiscService');

const {
  leave,
} = Stage;
const lobby = new Scene('lobby');

lobby.enter(({ replyWithMarkdown, session }) => {
  const { nickname, prof, lvl } = session.character;
  const { icon } = Object.values(charDescr).find((el) => el.prof === prof);

  replyWithMarkdown(
    `*Лобби*
Так-так, значит ты *${nickname}* (${icon}${lvl})`,
    Markup.keyboard([
      ['⚔ В бой'],
      ['😎 Профиль', '🏪 Магазин'],
      ['☸ Настройки', '❓ Помощь'],
    ]).resize().extra(),
  );
});

lobby.command('exit', ({ scene }) => {
  leave();
  scene.enter('greeter');
});

lobby.hears('😎 Профиль', ({ scene }) => {
  leave();
  scene.enter('profile');
});

lobby.hears('⚔ В бой', ({ scene }) => {
  leave();
  scene.enter('battleScene');
});

lobby.hears('🏪 Магазин', ({ scene }) => {
  leave();
  scene.enter('shopScene');
});

lobby.hears('☸ Настройки', ({ scene }) => {
  leave();
  scene.enter('settings');
});

module.exports = lobby;
