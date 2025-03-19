import { Scenes } from 'telegraf';
import type { BotContext } from '../fwo';
import { clanScene } from './clan';
import { createClanScene } from './createClan';
import { greeter } from './greeter';
import { settingsScene } from './settings';

export const stage = new Scenes.Stage<BotContext>([
  clanScene,
  createClanScene,
  greeter,
  settingsScene,
]);
const { leave } = Scenes.Stage;

// Глобальная команда выхода из сцен
stage.command('cancel', () => {
  leave();
});

stage.command('help', async (ctx) => {
  ctx.reply('https://telegra.ph/Fight-Wold-Online-Help-11-05');
});
