const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');
const loginHelper = require('../helpers/loginHelper');

const { leave } = Stage;
const greeter = new Scene('greeter');

greeter.enter(async ({ update, reply, scene, session }) => {
  const resp = await loginHelper.check(update.message.from.id);
  if (resp) {
    // eslint-disable-next-line no-param-reassign
    // @todo вот тут под вопросом
    session.character = resp;
    reply('Привет');
    leave();
    scene.enter('lobby');
  } else {
    leave();
    scene.enter('create');
  }
});

greeter.hears('Удалить', async ({ scene, reply, from }) => {
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

greeter.hears('Войти', async ({ scene, reply, session }) => {
  if (session.character) {
    reply('Сначала тебе нужно создать персонажа');
    leave();
    scene.enter('create');
  } else {
    leave();
    scene.enter('lobby');
  }
});

greeter.hears('Создать', ({ scene }) => {
  leave();
  scene.enter('create');
});


module.exports = greeter;
