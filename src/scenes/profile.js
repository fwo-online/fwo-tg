const Scene = require('telegraf/scenes/base');
const Stage = require('telegraf/stage');
const Markup = require('telegraf/markup');

const { leave } = Stage;
const profile = new Scene('profile');

const HARK_NAMES = {
  str: ['Сила', 'str'],
  dex: ['Ловкость', 'dex'],
  wis: ['Мудрость', 'wis'],
  int: ['Интелект', 'int'],
  con: ['Телосложение', 'con'],
};

const getInlineButton = (hark) => {
  return [
    {
      text: `${HARK_NAMES.hark[0]}: ${hark}`,
      callback_data: 'do_nothing',
    },
    {
      text: '-',
      callback_data: `decrease_${HARK_NAMES.hark[1]}`,
    },
    {
      text: '+',
      callback_data: `increase_${HARK_NAMES.hark[1]}`,
    }
  ]
};

profile.enter(({ reply, session }) => {
  reply(
    `Твой профиль, ${session.character.nickname}`,
    Markup.keyboard(['Характеристики']).oneTime().resize().extra(),
  );
});

profile.hears('Характеристики', ({ reply, session }) => {
  const { free, str, dex, wis, int, con } = session.character;
  reply(
    `Свободных очков ${free}`,
    Markup.inlineKeyboard([
      getInlineButton(str),
      getInlineButton(dex),
      getInlineButton(wis),
      getInlineButton(int),
      getInlineButton(con),
    ]).resize().extra(),
  );
});

profile.action(/increase(?=_)/, ({ session, editMessageText, match }) => {
  const [, hark] = match.input.split('_');
  // eslint-disable-next-line no-param-reassign
  session.character[hark] += 1;
  // eslint-disable-next-line no-param-reassign
  session.character.free -= 1;
  editMessageText(
    `Свободных очков ${free}`,
    Markup.inlineKeyboard([
      getInlineButton(str),
      getInlineButton(dex),
      getInlineButton(wis),
      getInlineButton(int),
      getInlineButton(con),
    ]).resize().extra(),
  );
});

profile.action(/decrease(?=_)/, ({ session, editMessageText, match }) => {
  const [, hark] = match.input.split('_');
  // eslint-disable-next-line no-param-reassign
  session.character[hark] -= 1;
  // eslint-disable-next-line no-param-reassign
  session.character.free += 1;
  editMessageText(
    `Свободных очков ${free}`,
    Markup.inlineKeyboard([
      getInlineButton(str),
      getInlineButton(dex),
      getInlineButton(wis),
      getInlineButton(int),
      getInlineButton(con),
    ]).resize().extra(),
  );
});

profile.command('exix', ({ scene }) => {
  leave();
  scene.enter('lobby');
});


module.exports = profile;
