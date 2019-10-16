const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');
const loginHelper = require('../helpers/loginHelper');

const { leave } = Stage;
const greeter = new Scene('greeter');

greeter.enter(async (ctx) => {
  const resp = await loginHelper.check(ctx.update.message.from.id);
  if (resp) {
    // eslint-disable-next-line no-param-reassign
    ctx.session.character = await loginHelper.getChar(ctx.update.message.from.id);
    // reply('Привет');
    ctx.reply(JSON.stringify(ctx));
    leave();
    ctx.scene.enter('lobby');
  } else {
    // eslint-disable-next-line no-param-reassign
    ctx.session.character = {};
    leave();
    ctx.scene.enter('create');
  }
});

module.exports = greeter;
