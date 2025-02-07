import { app } from '@/server';
import type { Context, Scenes } from 'telegraf';
import { Telegraf, session } from 'telegraf';
import arena from './arena';
import type { CharacterService } from './arena/CharacterService';
import MM from './arena/MatchMakingService';
import * as actions from './arena/actions';
import * as magics from './arena/magics';
import * as passiveSkills from './arena/passiveSkills';
import * as skills from './arena/skills';
import * as weaponMastery from './arena/weaponMastery';
import * as middlewares from './middlewares';
import { connect } from './models';
import { ItemModel } from './models/item';
import { stage } from './scenes/stage';
import { registerAffects } from './utils/registerAffects';
import { serve } from 'bun';
import { createBunWebSocket } from 'hono/bun';
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import { middleware, onConnection, onCreate } from '@/server/ws';

const { websocket } = createBunWebSocket();

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
arena.actions = { ...actions, ...magics, ...skills, ...passiveSkills, ...weaponMastery };

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

serve({
  fetch: app.fetch,
  websocket,
  port: 3000,
});

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: ['http://192.168.10.56:5173'] },
});

onCreate(io);

httpServer.listen(4000);

io.use(middleware);
io.on('connection', (socket) => {
  onConnection(io, socket);
});
