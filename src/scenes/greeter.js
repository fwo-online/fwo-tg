const Stage = require('telegraf/stage');

const { leave } = Stage;
const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');
const loginHelper = require('../helpers/loginHelper');

let isFindOne = false;
const greeter = new Scene('greeter');

greeter.enter(async ({ update, reply }) => {
  const resp = await loginHelper.check(update.message.from.id);
  if (resp) {
    isFindOne = true;
    reply(
      `Здравствуй, сраный путник. Я вижу ты здесь не первый раз. 
      У тебя есть персонаж класса ${resp.prof}.
      Бла бла бла.
      Вот две кнопки. Одна удалит твоего персонажа, 
      вторая отправит его в мир`,
      Markup.keyboard([['Войти', 'Удалить']]).oneTime().resize().extra(),
    );
  } else {
    isFindOne = false;
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

greeter.hears('Войти', ({ scene, reply }) => {
  if (!isFindOne) {
    reply('Сначала тебе нужно создать персонажа');
    leave();
    scene.enter('create');
  }
  leave();
  scene.enter('lobby');
});

greeter.hears('Создать', ({ scene }) => {
  leave();
  scene.enter('create');
});


module.exports = greeter;
