const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');
const { charDescr } = require('../arena/MiscService');

const lobby = new Scene('lobby');

lobby.enter(async ({ replyWithMarkdown, replyWithPhoto, session }) => {
  const { nickname, prof, lvl } = session.character;
  const { icon } = Object.values(charDescr).find((el) => el.prof === prof);

  try {
    await replyWithPhoto({ source: './assets/market.jpg' });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
  await replyWithMarkdown(
    `*Лобби*
Так-так, значит ты *${nickname}* (${icon}${lvl})`,
    Markup.keyboard([
      ['⚔ В бой'],
      ['🏰 Клан'],
      ['😎 Профиль', '🏪 Магазин'],
      ['☸ Настройки', '❓ Помощь'],
    ]).resize().extra(),
  );
});

lobby.hears('😎 Профиль', ({ scene }) => {
  scene.enter('profile');
});

lobby.hears('⚔ В бой', ({ scene }) => {
  scene.enter('battleScene');
});

lobby.hears('🏪 Магазин', ({ scene }) => {
  scene.enter('shopScene');
});

lobby.hears('☸ Настройки', ({ scene }) => {
  scene.enter('settings');
});

lobby.hears('🏰 Клан', ({ scene }) => {
  scene.enter('clan');
});

module.exports = lobby;
