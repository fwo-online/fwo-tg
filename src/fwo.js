const Telegraf = require('telegraf');
const session = require('telegraf/session');
const db = require('./models');
const stage = require('./scenes/stage.js');
const channelHelper = require('./helpers/channelHelper');
const Item = require('./models/item');
const authMiddleware = require('./middlewares/authMiddleware');
const protectedMiddleware = require('./middlewares/protectedMiddleware');
const chatMiddleware = require('./middlewares/chatMiddleware');
const restartMiddleware = require('./middlewares/restartMiddleware');
const MM = require('./arena/MatchMakingService');
const arena = require('./arena');
const magics = require('./arena/magics');

// DB connection
db.connection.on('open', () => {
  // eslint-disable-next-line no-console
  console.log('db online');
  Item.load();
});

MM.start();
arena.mm = MM;
arena.magics = magics;

const bot = new Telegraf(process.env.BOT_TOKEN);

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
bot.launch();

channelHelper.bot = bot;
