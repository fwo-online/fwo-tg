import { Scenes, Markup } from 'telegraf';
import { MARKET_STICKER_ID } from '@/assets/stickers';
import { Profs } from '../data';
import type { BotContext } from '../fwo';

export const lobby = new Scenes.BaseScene<BotContext>('lobby');

lobby.enter(async (ctx) => {
  const { nickname, prof, lvl, exp, nextLvlExp, gold, bonus } = ctx.session.character;

  try {
    await ctx.sendSticker(MARKET_STICKER_ID);
  } catch {}

  await ctx.replyWithMarkdown(
    `*Лобби*
Так-так, значит ты *${nickname}* ${Profs.profsData[prof].icon}${lvl}
Exp: (📖${exp}/${nextLvlExp}) Gold: 💰 ${gold} Bonus: ${bonus}`,
    Markup.keyboard([['⚔ В бой'], ['🏰 Клан'], ['☸ Настройки', '❓ Помощь']]).resize(),
  );

  if (ctx.session.character.wasLvlUp) {
    await ctx.replyWithMarkdown('Получен новый уровень!🌟');
    ctx.session.character.wasLvlUp = false;
  }
});

lobby.hears('⚔ В бой', async (ctx) => {
  await ctx.scene.enter('battleScene');
});

lobby.hears('☸ Настройки', async (ctx) => {
  await ctx.scene.enter('settings');
});

lobby.hears('🏰 Клан', async (ctx) => {
  await ctx.scene.enter('clan');
});

lobby.hears('❓ Помощь', async (ctx) => {
  await ctx.reply('https://telegra.ph/Fight-Wold-Online-Help-11-05');
});
