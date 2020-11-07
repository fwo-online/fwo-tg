import { Telegraf, session } from 'telegraf';
import type { SceneContextMessageUpdate } from 'telegraf/typings/stage';
import arena from './arena';
import actions from './arena/actions';
import type Char from './arena/CharacterService';
import * as magics from './arena/magics';
import MM from './arena/MatchMakingService';
import * as skills from './arena/skills';
import channelHelper from './helpers/channelHelper';
import authMiddleware from './middlewares/authMiddleware';
import chatMiddleware from './middlewares/chatMiddleware';
import protectedMiddleware from './middlewares/protectedMiddleware';
import restartMiddleware from './middlewares/restartMiddleware';
import db from './models';
import { ItemModel } from './models/item';
import stage from './scenes/stage';

export interface BotContext extends SceneContextMessageUpdate {
  session: {
    character: Char;
  }
}

const bot = new Telegraf<BotContext>(process.env.BOT_TOKEN ?? '');
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
