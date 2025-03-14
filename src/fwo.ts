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
import { LogService } from './arena/LogService';
import { broadcast } from './helpers/channelHelper';
import { bold } from './utils/formatString';
import { reservedClanName } from '@fwo/schemas';
import { isString } from 'es-toolkit';

const { websocket } = createBunWebSocket();

interface BotSession extends Scenes.SceneSession {
  character: CharacterService;
}
export interface BotContext extends Context {
  session: BotSession;
  scene: Scenes.SceneContextScene<BotContext>;
}

// console.l;
export const bot = new Telegraf<BotContext>(process.env.BOT_TOKEN ?? '', {
  telegram: { testEnv: process.env.NODE_ENV === 'development' },
});
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

MM.on('start', (game) => {
  const log = new LogService();
  broadcast('Игра начинается');
  game.on('startOrders', () => {
    broadcast('Пришло время делать заказы');
  });
  game.on('startRound', (e) => {
    broadcast(`⚡️ Раунд ${e.round} начинается ⚡`);
  });
  game.on('endRound', (e) => {
    log.sendBattleLog(e.log);
    broadcast(`Погибшие в этом раунде: ${e.dead.map(({ nick }) => nick).join(', ')}`);
  });

  game.on('end', (e) => {
    const getStatusString = (p: { exp: number; gold: number; nick: string }) =>
      `\t👤 ${p.nick} получает ${p.exp}📖 и ${p.gold}💰`;
    broadcast('Игра завершена');
    broadcast(`${bold`Статистика игры`}
${Object.entries(e.statistic).map(([clan, players]) => `${clan === reservedClanName ? 'Без клана' : clan}\n ${players?.map(getStatusString)}`)}`);
  });
});

registerAffects();

bot.use(session());
bot.use(stage.middleware());
bot.use(middlewares.chatMiddleware());

bot.start(async (ctx) => {
  await ctx.scene.enter('greeter');
});

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
  cors: { origin: [process.env.APP_URL].filter(isString) },
});

onCreate(io);

httpServer.listen(4000);

io.use(middleware);
io.on('connection', (socket) => {
  onConnection(io, socket);
});
