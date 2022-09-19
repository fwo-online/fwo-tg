import * as http from 'http';
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
import { connect } from './models';
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
void connect(async () => {
  console.log('db online');
  await ItemModel.load();
  await bot.launch();
});

arena.mm = MM;
arena.magics = magics;
arena.skills = skills;
arena.actions = actions;

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

// Heroku health check hack
// Create a local server to receive data from
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    data: 'Hello FightWorld!',
  }));
});
const PORT = process.env.PORT || 8080;
server.listen(PORT);
