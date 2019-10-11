const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

const { leave } = Stage;
const create = new Scene('create');
const charDescr = {
  Лучник: 'ахуенный', Маг: 'волшебный', Воин: 'стронг', Лекарь: 'хилит',
};

create.enter(async ({ reply }) => {
  reply(
    `Здравствуй, сраный путник. Я вижу ты здесь впервые.
      Бла бла бла.Вот кнопка, чтобы создать персонажа.`,
    Markup.keyboard(['Создать']).oneTime().resize().extra(),
  );
});

create.hears('Создать', ({ reply }) => {
  reply('Странные упыри ползут со всех сторон, нам нужны бойцы, кем ты желаешь стать в этом мире?',
    Markup.keyboard(['Маг', 'Лучник', 'Воин', 'Лекарь']).oneTime().resize().extra());
});

create.hears('Ник', ({ scene }) => {
  leave();
  scene.enter('setNick');
});

create.hears(/Лучник|Воин|Маг|Лекарь/gi, ({ reply, message, session }) => {
  // eslint-disable-next-line no-param-reassign
  session.charProf = message.text;
  reply(
    `Ты выбрал класс ${message.text}.
      ${message.text} – ${charDescr[message.text]}. 
      Выбрать или вернуться назад?`,
    Markup.keyboard(['Выбрать', 'Назад']).oneTime().resize().extra(),
  );
});

create.hears('Выбрать', async ({ reply, session }) => {
  if (!session.charProf) {
    reply('Не понятно, какой то ты странный',
      Markup.keyboard(['Маг', 'Лучник', 'Воин', 'Лекарь']).oneTime().resize().extra());
  } else {
    reply(
      `Твой класс — ${session.charProf}. Теперь нужно определиться с ником`,
      Markup.keyboard(['Ник']).oneTime().resize().extra(),
    );
  }
});

create.hears('Назад', ({ reply }) => {
  reply('Думаешь лучше попробовать кем то другим?',
    Markup.keyboard(['Маг', 'Лучник', 'Воин', 'Лекарь']).oneTime().resize().extra());
});

module.exports = create;
