const Scene = require('telegraf/scenes/base');
const Stage = require('telegraf/stage');

const { leave } = Stage;
const lobby = new Scene('lobby');
const loginHelper = require('../helpers/loginHelper');

lobby.enter(({ reply, session }) => {
  reply(
    `Lobby
Так так, значит ты ${session.character.nickname}
Статистика: ⬆ ${session.character.lvl} 💰 ${session.character.gold} 📖 ${session.character.exp}

Отсюда можно выйти: /exit 
Или удалить персонажа: /remove 
Тестовые разделы: /profile /battle /shop
`,
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
});

lobby.command('shop', ({ scene }) => {
  leave();
  scene.enter('shop');
});

lobby.command('remove', async ({
  session, scene, reply, from,
}) => {
  const resp = await loginHelper.remove(from.id);
  session.character = null;
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
