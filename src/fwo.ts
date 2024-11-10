import type { Context, Scenes } from 'telegraf';
import {
  Telegraf, session,
} from 'telegraf';
import arena from './arena';
import * as actions from './arena/actions';
import type { CharacterService } from './arena/CharacterService';
import * as magics from './arena/magics';
import MM from './arena/MatchMakingService';
import * as skills from './arena/skills';
import * as middlewares from './middlewares';
import { connect } from './models';
import { ItemModel } from './models/item';
import { stage } from './scenes/stage';
import { server } from '@/server';
import { registerAffects } from './utils/registerAffects';

interface BotSession extends Scenes.SceneSession {
  character: CharacterService;
}
export interface BotContext extends Context {
  session: BotSession;
  scene: Scenes.SceneContextScene<BotContext>
}

export const bot = new Telegraf<BotContext>(process.env.BOT_TOKEN ?? '', { telegram: { testEnv: process.env.NODE_ENV === 'development' } });
// DB connection
void connect(async () => {
  console.log('db online');
  await ItemModel.load();

  await bot.launch();
});

arena.mm = MM;
arena.magics = magics;
arena.skills = skills;
arena.actions = actions;

registerAffects();

bot.use(session());
bot.use(stage.middleware());
bot.use(middlewares.chatMiddleware());
bot.use(middlewares.authMiddleware());

bot.start(async ({ scene }) => { await scene.enter('greeter'); });
bot.command('greeter', (ctx) => ctx.scene.enter('greeter'));

bot.use(middlewares.restartMiddleware());
bot.use(middlewares.protectedMiddleware());

// далее идут роуты для которых необходимо что бы персонаж был создан

bot.command('profile', (ctx) => ctx.scene.enter('profile'));
bot.command('inventory', (ctx) => ctx.scene.enter('inventory'));

// нужно поставить условие, что бы это поднималось только в деве
// bot.startWebhook('/test', null, 3000);
arena.bot = bot;

export default server;
