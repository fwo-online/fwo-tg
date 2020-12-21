import { BaseScene, Markup } from 'telegraf';
import { profs } from '../data/profs';
import type { BotContext } from '../fwo';

const lobby = new BaseScene<BotContext>('lobby');

lobby.enter(async ({ replyWithMarkdown, replyWithPhoto, session }) => {
  const {
    nickname, prof, lvl, exp, nextLvlExp,
  } = session.character;

  try {
    await replyWithPhoto({ source: './src/assets/market.jpg' });
  } catch (e) {
    console.error(e);
  }

  await replyWithMarkdown(
    `*Лобби*
Так-так, значит ты *${nickname}* ${profs[prof].icon}${lvl} (📖${exp}/${nextLvlExp})`,
    Markup.keyboard([
      ['⚔ В бой'],
      ['🏰 Клан'],
      ['😎 Профиль', '🏪 Магазин'],
      ['☸ Настройки', '❓ Помощь'],
    ]).resize().extra(),
  );

  if (session.character.wasLvlUp) {
    await replyWithMarkdown('Получен новый уровень!🌟');
    session.character.wasLvlUp = false;
  }
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

export default lobby;
