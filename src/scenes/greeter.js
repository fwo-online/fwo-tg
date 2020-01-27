
const Scene = require('telegraf/scenes/base');

const greeter = new Scene('greeter');

greeter.enter(async ({
  reply, scene, session,
}) => {
  if (session.character) {
    await reply('FWO - Arena');
    scene.enter('lobby');
  } else {
    scene.enter('create');
  }
});

module.exports = greeter;
