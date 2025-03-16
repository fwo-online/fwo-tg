import { app } from '@/server';
import type { Context, Scenes } from 'telegraf';
import { Telegraf, session } from 'telegraf';
import arena from './arena';
import type { CharacterService } from './arena/CharacterService';
import * as middlewares from './middlewares';
import { connect } from './models';
import { ItemModel } from './models/item';
import { stage } from './scenes/stage';
import { registerAffects } from './utils/registerAffects';
import { registerGlobals } from './utils/registerGlobals';
import { serve } from '@hono/node-server';
import { Server } from 'socket.io';
import { middleware, onConnection, onCreate } from '@/server/ws';
import { isString } from 'es-toolkit';
import { initGameChannel } from './helpers/channelHelper';
import { ItemSetModel } from './models/item-set';

interface BotSession extends Scenes.SceneSession {
  character: CharacterService;
}
export interface BotContext extends Context {
  session: BotSession;
  scene: Scenes.SceneContextScene<BotContext>;
}

export const bot = new Telegraf<BotContext>(process.env.BOT_TOKEN ?? '', {
  telegram: { testEnv: process.env.NODE_ENV === 'development' },
});

// DB connection
void connect(async () => {
  console.log('db online');
  await ItemModel.load();
  await ItemSetModel.load();

  await bot.launch();
});

registerGlobals();
registerAffects();
initGameChannel();

bot.use(session());
bot.use(stage.middleware());
bot.use(middlewares.chatMiddleware());

bot.start(async (ctx) => {
  await ctx.scene.enter('greeter');
});

// нужно поставить условие, что бы это поднималось только в деве
// bot.startWebhook('/test', null, 3000);
arena.bot = bot;

const server = serve({
  fetch: app.fetch,
  port: 3000,
});

const io = new Server(server, {
  cors: { origin: [process.env.APP_URL].filter(isString) },
});

onCreate(io);

io.use(middleware);
io.on('connection', (socket) => {
  onConnection(io, socket);
});
