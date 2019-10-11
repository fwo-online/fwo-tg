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
  const resp = await loginHelper.check(update.message.from.id);
  if (resp && resp.tgid === update.message.from.id) {
    reply(`У тебя уже есть персонаж класса ${resp.prof}.
        Ты можешь удалить его, а затем создать нового,
        либо войти в лобби`,
    Markup.keyboard([['Войти', 'Удалить']]).oneTime().resize().extra());
  } else {
    selectRole(reply);
  }
});

create.on('text', async ({
  reply, message, from, scene, session
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
    const resp = await loginHelper.regChar(from.id, selectedRole, 'm', (e) => { console.log(e); });
    if (resp) {
      session.character = resp;
      reply(
        `Твой класс — ${selectedRole}. Теперь ты можешь войти в лобби`,
        Markup.keyboard(['Войти']).oneTime().resize().extra(),
      );
    }
  }

  if (message.text.match(/Назад/gi)) {
    selectRole(reply);
  }

  if (message.text.match(/Войти/gi)) {
    leave();
    scene.enter('lobby');
  }
});

module.exports = create;
