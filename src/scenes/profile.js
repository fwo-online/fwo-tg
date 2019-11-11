const Scene = require('telegraf/scenes/base');
const Stage = require('telegraf/stage');
const Markup = require('telegraf/markup');
const loginHelper = require('../helpers/loginHelper');

const { leave } = Stage;
const profile = new Scene('profile');

const allHarks = ['str', 'dex', 'wis', 'int', 'con'];
const HARK_NAMES = {
  str: 'Сила',
  dex: 'Ловкость',
  wis: 'Мудрость',
  int: 'Интелект',
  con: 'Телосложение',
};

const getInlineButton = ({ harks }, hark) => [
  Markup.callbackButton(
    `${HARK_NAMES[hark]}: ${harks[hark]}`,
    'do_nothing',
  ),
  Markup.callbackButton(
    `+${harks[`${hark}Temp`] ? harks[hark] - harks[`${hark}Temp`] : ''}`,
    `increase_${hark}`,
  ),
];

const getInlineConfirmButton = () => [
  Markup.callbackButton('Подтвердить', 'confirm'),
];

const getInlineResetButton = () => [
  Markup.callbackButton('Сбросить', 'reset'),
];


const getInlineKeyboard = (character) => {
  const inlineKeyboardArr = [];

  allHarks.forEach((hark) => inlineKeyboardArr.push(getInlineButton(character, hark)));
  inlineKeyboardArr.push(getInlineResetButton());
  inlineKeyboardArr.push(getInlineConfirmButton());

  return inlineKeyboardArr;
};

profile.enter(({ reply, session }) => {
  reply(
    `Твой профиль, ${session.character.nickname}
Статистика:
    Игр: ${session.character.statistics.games}
    Убийств: ${session.character.statistics.kills}
    `,
    Markup.inlineKeyboard([
      Markup.callbackButton('Характеристики', 'harks'),
    ]).resize().extra(),
  );
});

profile.action('harks', ({ editMessageText, session }) => {
  const { free } = session.character;

  editMessageText(
    `Свободных очков ${free}`,
    Markup.inlineKeyboard([
      ...getInlineKeyboard(session.character),
    ]).resize().extra(),
  );
});

profile.action(/increase(?=_)/, ({ session, editMessageText, match }) => {
  if (session.character.free === 0) return;
  const [, hark] = match.input.split('_');
  // eslint-disable-next-line no-param-reassign
  session.character.harks[`${hark}Temp`] = session.character.harks[`${hark}Temp`] || session.character.harks[hark];
  // eslint-disable-next-line no-param-reassign
  session.character.harks[hark] += 1;
  // eslint-disable-next-line no-param-reassign
  session.character.free -= 1;

  editMessageText(
    `Свободных очков ${session.character.free}`,
    Markup.inlineKeyboard([
      ...getInlineKeyboard(session.character),
    ]).resize().extra(),
  );
});

profile.action('confirm', async ({ session, update, editMessageText }) => {
  await loginHelper.saveHarks(update.callback_query.from.id, session.character);
  // eslint-disable-next-line no-param-reassign
  allHarks.forEach((hark) => delete session.character.harks[`${hark}Temp`]);
  editMessageText(
    `Твой профиль, ${session.character.nickname}
Статистика:
    Игр: ${session.character.statistics.games}
    Убийств: ${session.character.statistics.kills}
    `,
    Markup.inlineKeyboard([
      Markup.callbackButton('Характеристики', 'harks'),
    ]).resize().extra(),
  );
});

profile.action('reset', async ({ session, editMessageText, update }) => {
  // eslint-disable-next-line no-param-reassign
  session.character = await loginHelper.getChar(update.callback_query.from.id);
  const { free } = session.character;

  editMessageText(
    `Свободных очков ${free}`,
    Markup.inlineKeyboard([
      ...getInlineKeyboard(session.character),
    ]).resize().extra(),
  );
});

profile.command('exit', ({ scene }) => {
  leave();
  scene.enter('lobby');
});


module.exports = profile;
