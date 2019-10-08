/**
 * Startup Module
 */
const Telegraf = require('telegraf');
const express = require('express');
const bot = new Telegraf(process.env.BOT_TOKEN);

if (! process.env.BOT_TOKEN) console.log('Problem in BOT_TOKEN')

bot.on('text', ({ replyWithHTML }) => replyWithHTML('<b>Hello</b>'))

const app = express()
app.get('/', (req, res) => res.send('Hello World!'))
app.use(bot.webhookCallback('/secret-path'))
app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
});
