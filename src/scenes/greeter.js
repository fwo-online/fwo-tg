const { BaseScene } = require('telegraf');

/** @type {import('./stage').BaseGameScene} */
const greeter = new BaseScene('greeter');

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
