const Scene = require('telegraf/scenes/base');
const Stage = require('telegraf/stage');
const Markup = require('telegraf/markup');

const {
  leave,
} = Stage;
const lobby = new Scene('lobby');
const loginHelper = require('../helpers/loginHelper');

lobby.enter(({ replyWithMarkdown, session }) => replyWithMarkdown(
  `Lobby
Так так, значит ты *${session.character.nickname}*
Статистика: ⬆ ${session.character.lvl} 💰 ${session.character.gold} 📖 ${session.character.exp}
`, Markup.keyboard([
    ['⚔ В бой'],
    ['😎 Профиль', '🏪 Магазин'],
    ['☸ Настройки', '❓ Помощь'],
  ])
    .resize()
    .extra(),
));

lobby.command('exit', ({
  scene,
}) => {
  leave();
  scene.enter('greeter');
});

lobby.hears('😎 Профиль', ({ scene }) => {
  leave();
  scene.enter('profile');
});

lobby.hears('⚔ В бой', ({ scene }) => {
  leave();
  scene.enter('battleScene');
});

lobby.command('remove', async ({
  session,
  scene,
  reply,
  from,
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
