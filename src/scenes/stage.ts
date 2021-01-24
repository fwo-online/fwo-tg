import { Scenes } from 'telegraf';
import type { BotContext } from '../fwo';
import { battleScene } from './battle';
import { clanScene } from './clan';
import { create } from './create';
import { createClanScene } from './createClan';
import { greeter } from './greeter';
import { harkScene } from './harks';
import { inventoryScene } from './inventory';
import { lobby } from './lobby';
import { magicScene } from './magics';
import { profile } from './profile';
import { settingsScene } from './settings';
import { shopScene } from './shop';
import { skillsScene } from './skills';

export const stage = new Scenes.Stage<BotContext>([
  battleScene,
  clanScene,
  create,
  createClanScene,
  greeter,
  inventoryScene,
  harkScene,
  lobby,
  magicScene,
  profile,
  settingsScene,
  shopScene,
  skillsScene,
]);
const { leave } = Scenes.Stage;

// Глобальная команда выхода из сцен
stage.command('cancel', () => { leave(); });
