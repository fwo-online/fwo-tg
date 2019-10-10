const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

const create = new Scene('create');
const charDescr = {
  Лучник: 'ахуенный', Маг: 'волшебный', Воин: 'стронг', Лекарь: 'хилит',
};
let selectedRole = null;
const selectRole = (reply) => reply('Вот тебе 4 кнопки.',
  Markup.keyboard(['Маг', 'Лучник', 'Воин', 'Лекарь'])
    .oneTime()
    .resize()
    .extra());
create.enter(({ reply }) => selectRole(reply));

create.on('text', ({ reply, message }) => {
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
    reply(
      `Твой класс — ${selectedRole}. Дальше ничего нет. Можешь не пытаться.`,
      Markup.keyboard(['/start']).oneTime().resize().extra(),
    );
  }
  if (message.text.match(/Назад/gi)) {
    selectRole(reply);
  }
});
module.exports = create;
