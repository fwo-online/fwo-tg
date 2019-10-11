const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');
const loginHelper = require('../helpers/loginHelper');

const { leave } = Stage;
const create = new Scene('create');
const charDescr = {
  Лучник: 'ахуенный', Маг: 'волшебный', Воин: 'стронг', Лекарь: 'хилит',
};

let selectedRole = null;
const selectRole = (reply) => {
  reply('Вот тебе 4 кнопки.',
    Markup.keyboard(['Маг', 'Лучник', 'Воин', 'Лекарь']).oneTime().resize().extra());
};
create.enter(async ({ update, reply }) => {
  reply(
    `Здравствуй, сраный путник. Я вижу ты здесь впервые.
      Бла бла бла.Вот кнопка, чтобы создать персонажа.`,
    Markup.keyboard(['Создать']).oneTime().resize().extra(),
  );
});

create.on('text', async ({
  reply, message, from, scene, session,
}) => {
  if (message.text.match(/Лучник|Воин|Маг|Лекарь/gi)) {
    selectedRole = message.text;
    reply(
      `Ты выбрал класс ${message.text}.
        ${message.text} – ${charDescr[message.text]}. 
        Выбрать или вернуться назад?`,
      Markup.keyboard(['Выбрать', 'Назад']).oneTime().resize().extra(),
    );
  }

  if (message.text.match(/Выбрать/gi)) {
    // eslint-disable-next-line no-console
    if (!selectedRole) {
      reply('Не понятно, какой то ты странный');
      selectRole(reply);
    }
    await loginHelper.regChar(from.id, selectedRole, 'm');
    reply(
      `Твой класс — ${selectedRole}. Теперь нужно определиться с ником`,
      Markup.keyboard(['Ник']).oneTime().resize().extra(),
    );
  }
  if (message.text.match(/Ник/gi)) {
    leave();
    scene.enter('setNick');
  }

  if (message.text.match(/Назад/gi)) {
    selectRole(reply);
  }
});

module.exports = create;
