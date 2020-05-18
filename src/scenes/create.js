const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');
const { charDescr } = require('../arena/MiscService');
const messages = require('../messages');

const create = new Scene('create');

const getProfButtons = () => Object
  .keys(charDescr)
  .map((prof) => [Markup.callbackButton(
    `${charDescr[prof].name} ${charDescr[prof].icon}`,
    `select_${prof}`,
  )]);

create.enter(async ({ reply }) => {
  reply(
    messages.create.enter,
    Markup.inlineKeyboard([
      Markup.callbackButton('Создать', 'create'),
    ]).resize().extra(),
  );
});

create.action('create', ({ editMessageText }) => {
  editMessageText(
    'Странные упыри ползут со всех сторон, нам нужны бойцы, кем ты желаешь стать в этом мире?',
    Markup.inlineKeyboard(getProfButtons()).resize().extra(),
  );
});

create.action(/select(?=_)/, ({ editMessageText, session, match }) => {
  const [, prof] = match.input.split('_');
  const { name, descr } = charDescr[prof];

  session.prof = name;
  editMessageText(
    `Ты выбрал класс ${name}.
      ${name} – ${descr}. 
      Выбрать или вернуться назад?`,
    Markup.inlineKeyboard([
      Markup.callbackButton('Выбрать', 'select'),
      Markup.callbackButton('Назад', 'back'),
    ]).resize().extra(),
  );
});

create.action('select', async ({ editMessageText, scene }) => {
  await editMessageText('Отлично', Markup.inlineKeyboard([]));
  scene.enter('setNick');
});

create.action('back', async ({ editMessageText }) => {
  await editMessageText(
    'Думаешь лучше попробовать кем то другим?',
    Markup.inlineKeyboard(getProfButtons()).resize().extra(),
  );
});

module.exports = create;
