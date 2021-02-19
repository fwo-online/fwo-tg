import {
  Telegraf, session, Context, Scenes,
} from 'telegraf';
import arena from './arena';
import actions from './arena/actions';
import type Char from './arena/CharacterService';
import * as magics from './arena/magics';
import MM from './arena/MatchMakingService';
import * as skills from './arena/skills';
import * as middlewares from './middlewares';
import db from './models';
import { ItemModel } from './models/item';
import { stage } from './scenes/stage';

interface BotSession extends Scenes.SceneSession {
  character: Char;
}
export interface BotContext extends Context {
  session: BotSession;
  scene: Scenes.SceneContextScene<BotContext>
}

export const bot = new Telegraf<BotContext>(process.env.BOT_TOKEN ?? '');
// DB connection
db.connection.on('open', async () => {
  console.log('db online');
  await ItemModel.load();
  bot.launch();
});

arena.mm = MM;
arena.magics = magics;
arena.skills = skills;
arena.actions = actions;

bot.use(session());
bot.use(stage.middleware());
bot.use(middlewares.chatMiddleware());
bot.use(middlewares.authMiddleware());

bot.start(async ({ scene }) => { scene.enter('greeter'); });
bot.command('greeter', (ctx) => ctx.scene.enter('greeter'));

bot.use(middlewares.restartMiddleware());
bot.use(middlewares.protectedMiddleware());

// далее идут роуты для которых необходимо что бы персонаж был создан

bot.command('profile', (ctx) => ctx.scene.enter('profile'));
bot.command('inventory', (ctx) => ctx.scene.enter('inventory'));

// нужно поставить условие, что бы это поднималось только в деве
// bot.startWebhook('/test', null, 3000);
arena.bot = bot;
