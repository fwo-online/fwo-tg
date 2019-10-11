const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');
const loginHelper = require('../helpers/loginHelper');

const { leave } = Stage;
const greeter = new Scene('greeter');

greeter.enter(async ({ update, reply, scene, session }) => {
  const resp = await loginHelper.check(update.message.from.id);
  if (resp) {
    session.character = resp;
    leave();
    scene.enter('lobby');
  } else {
    reply(
      `Здравствуй, сраный путник. Я вижу ты здесь впервые.
      Бла бла бла.
      Вот кнопка, чтобы создать персонажа.`,
      Markup.keyboard(['Создать']).oneTime().resize().extra(),
    );
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
