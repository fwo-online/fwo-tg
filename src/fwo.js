const Telegraf = require('telegraf');
const session = require('telegraf/session');
const db = require('./models');
const stage = require('./scenes/stage.js');
const channelHelper = require('./helpers/channelHelper');
const Item = require('./models/item');

// DB connection

// eslint-disable-next-line no-console
db.connection.on('open', () => {
  console.log('db online')
  Item.load();
});

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session());
bot.use(stage.middleware());
bot.start(async ({ scene }) => { scene.enter('greeter'); });
bot.command('greeter', (ctx) => ctx.scene.enter('greeter'));
bot.launch();


channelHelper.bot = bot;
