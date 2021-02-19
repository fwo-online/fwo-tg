import { Scenes } from 'telegraf';
import type { BotContext } from '../fwo';

export const greeter = new Scenes.BaseScene<BotContext>('greeter');

greeter.enter(async (ctx) => {
  if (ctx.session.character) {
    await ctx.reply('FWO - Arena');
    ctx.scene.enter('lobby');
  } else {
    ctx.scene.enter('create');
  }
});
