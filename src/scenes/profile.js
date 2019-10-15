const Scene = require('telegraf/scenes/base');
const Stage = require('telegraf/stage');
const Markup = require('telegraf/markup');
const loginHelper = require('../helpers/loginHelper');

const { leave } = Stage;
const profile = new Scene('profile');

const HARK_NAMES = {
  str: 'Сила',
  dex: 'Ловкость',
  wis: 'Мудрость',
  int: 'Интелект',
  con: 'Телосложение',
};

const getInlineButton = ({ character }, hark) => [
  {
    text: `${HARK_NAMES[hark]}: ${character[hark]}`,
    callback_data: 'do_nothing',
  },
  {
    text: `+${character[`${hark}Temp`] ? character[hark] - character[`${hark}Temp`] : ''}`,
    callback_data: `increase_${hark}`,
  },
];

profile.enter(({ reply, session }) => {
  reply(
    `Твой профиль, ${session.character.nickname}`,
    Markup.keyboard(['Характеристики']).oneTime().resize().extra(),
  );
});

profile.hears('Характеристики', ({ reply, session }) => {
  const { free } = session.character;

  reply(
    `Свободных очков ${free}`,
    Markup.inlineKeyboard([
      getInlineButton(session, 'str'),
      getInlineButton(session, 'dex'),
      getInlineButton(session, 'wis'),
      getInlineButton(session, 'int'),
      getInlineButton(session, 'con'),
      [{
        text: 'Сбросить',
        callback_data: 'reset',
      }],
      [{
        text: 'Подтвердить',
        callback_data: 'confirm',
      }],
    ]).resize().extra(),
  );
});

profile.action(/increase(?=_)/, ({ session, editMessageText, match }) => {
  if (session.character.free === 0) return;
  const [, hark] = match.input.split('_');
  // eslint-disable-next-line no-param-reassign
  session.character[`${hark}Temp`] = session.character[`${hark}Temp`] || session.character[hark];
  // eslint-disable-next-line no-param-reassign
  session.character[hark] += 1;
  // eslint-disable-next-line no-param-reassign
  session.character.free -= 1;
  editMessageText(
    `Свободных очков ${session.character.free}`,
    Markup.inlineKeyboard([
      getInlineButton(session, 'str'),
      getInlineButton(session, 'dex'),
      getInlineButton(session, 'wis'),
      getInlineButton(session, 'int'),
      getInlineButton(session, 'con'),
      [{
        text: 'Сбросить',
        callback_data: 'reset',
      }],
      [{
        text: 'Подтвердить',
        callback_data: 'confirm',
      }],
    ]).resize().extra(),
  );
});

profile.action('confirm', async ({ session, scene, update }) => {
  await loginHelper.saveHarks(update.callback_query.from.id, session.character);
  leave();
  scene.enter('profile');
});

profile.action('reset', async ({ session, editMessageText, update }) => {
  // eslint-disable-next-line no-param-reassign
  session.character = await loginHelper.getChar(update.callback_query.from.id);
  const { free } = session.character;
  editMessageText(
    `Свободных очков ${free}`,
    Markup.inlineKeyboard([
      getInlineButton(session, 'str'),
      getInlineButton(session, 'dex'),
      getInlineButton(session, 'wis'),
      getInlineButton(session, 'int'),
      getInlineButton(session, 'con'),
      [{
        text: 'Сбросить',
        callback_data: 'reset',
      }],
      [{
        text: 'Подтвердить',
        callback_data: 'confirm',
      }],
    ]).resize().extra(),
  );
});

profile.command('exit', ({ scene }) => {
  leave();
  scene.enter('lobby');
});


module.exports = profile;
