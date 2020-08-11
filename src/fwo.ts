import { Telegraf, session, Context } from 'telegraf';
import db from './models';
import stage, { SceneContextMessageUpdate } from './scenes/stage';
import channelHelper from './helpers/channelHelper';
import Item from './models/item';
import authMiddleware from './middlewares/authMiddleware';
import protectedMiddleware from './middlewares/protectedMiddleware';
import chatMiddleware from './middlewares/chatMiddleware';
import restartMiddleware from './middlewares/restartMiddleware';
import MM from './arena/MatchMakingService';
import arena from './arena';
import magics from './arena/magics';
import skills from './arena/skills';
import actions from './arena/actions';

export interface Bot extends Context, SceneContextMessageUpdate {
}

const bot = new Telegraf<Bot>(process.env.BOT_TOKEN ?? '');
// DB connection
db.connection.on('open', async () => {
  // eslint-disable-next-line no-console
  console.log('db online');
  await Item.load();
  bot.launch();
});

arena.mm = MM;
arena.magics = magics;
arena.skills = skills;
arena.actions = actions;

bot.use(session());
bot.use(stage.middleware());
bot.use(chatMiddleware);
bot.use(authMiddleware);

bot.start(async ({ scene }) => { scene.enter('greeter'); });
bot.command('greeter', (ctx) => ctx.scene.enter('greeter'));

bot.use(restartMiddleware);
bot.use(protectedMiddleware);

// далее идут роуты для которых необходимо что бы персонаж был создан

bot.command('profile', (ctx) => ctx.scene.enter('profile'));
bot.command('inventory', (ctx) => ctx.scene.enter('inventory'));

// нужно поставить условие, что бы это поднималось только в деве
bot.startWebhook('/test', null, 3000);

channelHelper.bot = bot;
