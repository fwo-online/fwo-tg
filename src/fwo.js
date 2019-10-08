/**
 * Startup Module
 */
const Telegraf = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN);

if (!process.env.BOT_TOKEN) console.log('Problem in BOT_TOKEN')

bot.on('text', ({ replyWithHTML }) => replyWithHTML('<b>Hello</b>'))
