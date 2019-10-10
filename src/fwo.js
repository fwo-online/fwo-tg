const Telegraf = require('telegraf');
const session = require('telegraf/session');
// const Extra = require('telegraf/extra');
const db = require('./models');
const stage = require('./scenes/stage.js');

// DB connection

db.connection.on('open', () => console.log('db online'));
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session());
bot.use(stage.middleware());
bot.start(({ scene }) => scene.enter('greeter'));
bot.command('greeter', (ctx) => ctx.scene.enter('greeter'));
bot.command('create', (ctx) => ctx.scene.enter('create'));
bot.command('select', (ctx) => ctx.scene.enter('select'));
bot.launch();
