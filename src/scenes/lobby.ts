import { Scenes, Markup } from 'telegraf';
import { Profs } from '../data';
import type { BotContext } from '../fwo';

export const lobby = new Scenes.BaseScene<BotContext>('lobby');

lobby.enter(async (ctx) => {
  const {
    nickname, prof, lvl, exp, nextLvlExp,
  } = ctx.session.character;

  try {
    await ctx.replyWithPhoto({ source: './src/assets/market.jpg' });
  } catch (e) {
    console.error(e);
  }

  await ctx.replyWithMarkdown(
    `*Лобби*
Так-так, значит ты *${nickname}* ${Profs.profsData[prof].icon}${lvl} (📖${exp}/${nextLvlExp})`,
    Markup.keyboard([
      ['⚔ В бой'],
      ['🏰 Клан'],
      ['😎 Профиль', '🏪 Магазин'],
      ['☸ Настройки', '❓ Помощь'],
    ]).resize(),
  );

  if (ctx.session.character.wasLvlUp) {
    await ctx.replyWithMarkdown('Получен новый уровень!🌟');
    ctx.session.character.wasLvlUp = false;
  }
});

lobby.hears('😎 Профиль', (ctx) => {
  ctx.scene.enter('profile');
});

lobby.hears('⚔ В бой', (ctx) => {
  ctx.scene.enter('battleScene');
});

lobby.hears('🏪 Магазин', (ctx) => {
  ctx.scene.enter('shopScene');
});

lobby.hears('☸ Настройки', (ctx) => {
  ctx.scene.enter('settings');
});

lobby.hears('🏰 Клан', (ctx) => {
  ctx.scene.enter('clan');
});

lobby.hears('❓ Помощь', (ctx) => {
  ctx.reply('https://telegra.ph/Fight-Wold-Online-Help-11-05');
});
