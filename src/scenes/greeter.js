const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');

const { leave } = Stage;
const greeter = new Scene('greeter');

greeter.enter(async ({
  reply, scene, session,
}) => {
  if (session.character) {
    await reply('FWO - Arena');
    leave();
    scene.enter('lobby');
  } else {
    leave();
    scene.enter('create');
  }
});

module.exports = greeter;
