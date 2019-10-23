const Telegraf = require('telegraf');
const session = require('telegraf/session');
const db = require('./models');
const stage = require('./scenes/stage.js');

// DB connection

// eslint-disable-next-line no-console
db.connection.on('open', () => console.log('db online'));
const bot = new Telegraf(process.env.BOT_TOKEN);
const chatId = '-331233606';

bot.use(session());
bot.use(stage.middleware());
bot.start(({ scene }) => scene.enter('greeter'));
bot.command('greeter', (ctx) => ctx.scene.enter('greeter'));
bot.launch();

global.broadcast = (data) => {
  bot.telegram.sendMessage(chatId, data);
};
