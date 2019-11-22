const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

const { leave } = Stage;
const create = new Scene('create');
const charDescr = {
  Лучник: 'ахуенный', Маг: 'волшебный', Воин: 'стронг', Лекарь: 'хилит',
};

create.enter(({ reply }) => {
  reply(
    `Здравствуй, сраный путник. Я вижу ты здесь впервые.
      Бла бла бла.Вот кнопка, чтобы создать персонажа.`,
    Markup.inlineKeyboard([
      Markup.callbackButton('Создать', 'create'),
    ]).resize().extra(),
  );
});

create.action('create', ({ editMessageText }) => {
  editMessageText(
    'Странные упыри ползут со всех сторон, нам нужны бойцы, кем ты желаешь стать в этом мире?',
    Markup.inlineKeyboard([
      Markup.callbackButton('Маг', 'select_Маг'),
      Markup.callbackButton('Лучник', 'select_Лучник'),
      Markup.callbackButton('Воин', 'select_Воин'),
      Markup.callbackButton('Лекарь', 'select_Лекарь'),
    ]).resize().extra(),
  );
});

create.action(/select(?=_)/, ({ editMessageText, session, match }) => {
  const [, prof] = match.input.split('_');
  session.prof = prof;
  editMessageText(
    `Ты выбрал класс ${prof}.
      ${prof} – ${charDescr[prof]}. 
      Выбрать или вернуться назад?`,
    Markup.inlineKeyboard([
      Markup.callbackButton('Выбрать', 'select'),
      Markup.callbackButton('Назад', 'back'),
    ]).resize().extra(),
  );
});

create.action('select', ({ editMessageText, session, scene }) => {
  if (!session.prof) {
    editMessageText(
      'Не понятно, какой то ты странный',
      Markup.inlineKeyboard([
        Markup.callbackButton('Маг', 'select_Маг'),
        Markup.callbackButton('Лучник', 'select_Лучник'),
        Markup.callbackButton('Воин', 'select_Воин'),
        Markup.callbackButton('Лекарь', 'select_Лекарь'),
      ]).resize().extra(),
    );
  } else {
    editMessageText('Отлично', Markup.inlineKeyboard([]));
    leave();
    scene.enter('setNick');
  }
});

create.action('back', ({ editMessageText }) => {
  editMessageText(
    'Думаешь лучше попробовать кем то другим?',
    Markup.inlineKeyboard([
      Markup.callbackButton('Маг', 'select_Маг'),
      Markup.callbackButton('Лучник', 'select_Лучник'),
      Markup.callbackButton('Воин', 'select_Воин'),
      Markup.callbackButton('Лекарь', 'select_Лекарь'),
    ]).resize().extra(),
  );
});

module.exports = create;
