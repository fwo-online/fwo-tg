const Scene = require('telegraf/scenes/base');
const Stage = require('telegraf/stage');

const { leave } = Stage;
const lobby = new Scene('lobby');
const loginHelper = require('../helpers/loginHelper');

lobby.enter(({ reply, session }) => {
  reply(
    `*Lobby*
    Так так, значит ты "${session.character.nickname}"
    Отсюда можно выйти /exit /remove /profile /battle
    
    Твой персонаж имеет класс "${session.character.prof}"`,
  );
});

lobby.command('exit', ({ scene }) => {
  leave();
  scene.enter('greeter');
});

lobby.command('profile', ({ scene }) => {
  leave();
  scene.enter('profile');
});

lobby.command('battle', ({ scene }) => {
  leave();
  scene.enter('battleScene');
})

lobby.command('remove', async ({ scene, reply, from }) => {
  const resp = await loginHelper.remove(from.id);
  if (resp) {
    reply(
      'Твой персонаж был удалён!',
    );
    leave();
    scene.enter('greeter');
  } else {
    reply(
      'Произошла ошибка',
    );
    leave();
    scene.enter('greeter');
  }
});


module.exports = lobby;
