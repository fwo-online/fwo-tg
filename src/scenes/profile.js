const Scene = require('telegraf/scenes/base');
const Stage = require('telegraf/stage');
const Markup = require('telegraf/markup');
const MagicService = require('../arena/MagicService');
const CharacterService = require('../arena/CharacterService');

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

const getInlineButton = (character, hark) => [
  Markup.callbackButton(
    `${HARK_NAMES[hark]}: ${character.harks[hark]}`,
    'do_nothing',
  ),
  Markup.callbackButton(
    `+ ${character.getIncreaseHarkCount(hark)}`,
    `increase_${hark}`,
  ),
];

const getInlineConfirmButton = () => [
  Markup.callbackButton('Подтвердить', 'confirm'),
];

const getInlineResetButton = () => [
  Markup.callbackButton('Сбросить', 'reset'),
];

const getInlineBackButton = () => [
  Markup.callbackButton('Назад', 'back'),
];

const getInlineKeyboard = (character) => {
  const inlineKeyboardArr = [];

  allHarks.forEach(
    (hark) => inlineKeyboardArr.push(getInlineButton(character, hark)),
  );
  inlineKeyboardArr.push(getInlineResetButton());
  inlineKeyboardArr.push(getInlineConfirmButton());
  inlineKeyboardArr.push(getInlineBackButton());

  return inlineKeyboardArr;
};

const getMainMenu = (session) => [
  `Твой профиль, ${session.character.nickname}
Статистика:
    Игр: ${session.character.games}
    Убийств: ${session.character.kills}
    `,
  Markup.inlineKeyboard([
    Markup.callbackButton('Характеристики', 'harks'),
    Markup.callbackButton('Магии', 'magics'),
    Markup.callbackButton('Инвентарь', 'inventory'),
  ]).resize().extra(),
];

profile.enter(({ reply, session }) => {
  reply('Профиль', Markup.keyboard([
    ['🔙 Назад'],
  ]).resize().extra());
  reply(...getMainMenu(session));
});

profile.action('inventory', ({ scene }) => {
  scene.enter('inventory');
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
  const [, hark] = match.input.split('_');

  session.character.increaseHark(hark);

  editMessageText(
    `Свободных очков ${session.character.free}`,
    Markup.inlineKeyboard([
      ...getInlineKeyboard(session.character),
    ]).resize().extra(),
  );
});

profile.action('confirm', async ({ session, editMessageText }) => {
  await session.character.submitIncreaseHarks();

  editMessageText(
    `Свободных очков ${session.character.free}`,
    Markup.inlineKeyboard([
      ...getInlineKeyboard(session.character),
    ]).resize().extra(),
  );
});

profile.action('reset', async ({ session, editMessageText }) => {
  session.character.resetHarks();

  editMessageText(
    `Свободных очков ${session.character.free}`,
    Markup.inlineKeyboard([
      ...getInlineKeyboard(session.character),
    ]).resize().extra(),
  );
});

profile.action('magics', ({ editMessageText, session }) => {
  const magicButtons = [];
  const keys = Object.keys(session.character.magics);
  if (keys) {
    keys.forEach((key) => {
      magicButtons.push([
        Markup.callbackButton(`${key}: ${session.character.magics[key]}`,
          `about_${key}`)]);
    });
  }
  editMessageText(
    `Известные магии. Нажми на магию, чтобы узнать больше. У тебя ${session.character.bonus} бонусов`,
    Markup.inlineKeyboard([
      ...magicButtons,
      [
        Markup.callbackButton('Учить', 'learn'),
        Markup.callbackButton('Назад', 'back')],
    ]).resize().extra(),
  );
});

profile.action('learn', async ({ editMessageText, session }) => {
  try {
    await CharacterService.loading(session.character.id);

    session.character = {
      ...session.character, ...MagicService.learn(session.character.id, 1),
    };
    const magicButtons = [];
    const keys = Object.keys(session.character.magics);
    if (keys) {
      keys.forEach((key) => {
        magicButtons.push(
          Markup.callbackButton(`${key}: ${session.character.magics[key]}`,
            `about_${key}`),
        );
      });
    }
    editMessageText(
      `Теперь ты знаешь на одну магию больше. У тебя ${session.character.bonus} бонусов`,
      Markup.inlineKeyboard([
        magicButtons,
        [
          Markup.callbackButton('Учить', 'learn'),
          Markup.callbackButton('Назад', 'back')],
      ]).resize().extra(),
    );
  } catch (e) {
    editMessageText(
      `${e}`,
      Markup.inlineKeyboard([
        Markup.callbackButton('Назад', 'magics'),
      ]).resize().extra(),
    );
  }
});

profile.action(/about(?=_)/, ({ editMessageText, match }) => {
  const [, name] = match.input.split('_');
  const magic = MagicService.show(name);
  editMessageText(
    `${magic.name}: ${magic.desc}`,
    Markup.inlineKeyboard([
      Markup.callbackButton('Назад', 'magics'),
    ]).resize().extra(),
  );
});

profile.action('back', ({ editMessageText, session }) => {
  editMessageText(...getMainMenu(session));
});

profile.command('exit', ({ scene }) => {
  leave();
  scene.enter('lobby');
});

profile.hears('🔙 Назад', ({ scene }) => {
  leave();
  scene.enter('lobby');
});

module.exports = profile;
