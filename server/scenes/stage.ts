import { Scenes } from 'telegraf';
import type { BotContext } from '../fwo';
import { clanScene } from './clan';
import { createClanScene } from './createClan';
import { greeter } from './greeter';
import { lobby } from './lobby';
import { settingsScene } from './settings';

export const stage = new Scenes.Stage<BotContext>([
  clanScene,
  createClanScene,
  greeter,
  lobby,
  settingsScene,
]);
const { leave } = Scenes.Stage;

// Глобальная команда выхода из сцен
stage.command('cancel', () => {
  leave();
});
