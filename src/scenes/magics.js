const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');
const MagicService = require('../arena/MagicService');
const arena = require('../arena');

const magicScene = new Scene('magics');

const getMagicButtons = (character) => Object
  .keys(character.magics)
  .map((key) => [
    Markup.callbackButton(
      `${arena.magics[key].displayName}: ${character.magics[key]}`,
      `about_${key}`,
    ),
  ]);

const getLvlButtons = (length) => new Array(length).fill(0)
  .reduce((arr, curr, i) => [...arr, i + 1], [])
  .map((lvl) => Markup.callbackButton(lvl, `learn_${lvl}`));

magicScene.enter(async ({ replyWithMarkdown, session }) => {
  await replyWithMarkdown(
    '*Магии*',
    Markup.keyboard([
      ['🔙 В лобби'],
    ]).resize().extra(),
  );

  await replyWithMarkdown(
    `Известные магии. Нажми на магию, чтобы узнать о ней больше.
${session.character.lvl === 1 ? `Стоимость изучения магии *1💡*(${session.character.bonus}💡)` : ''}`,
    Markup.inlineKeyboard([
      ...getMagicButtons(session.character),
      [
        Markup.callbackButton('Учить', session.character.lvl === 1 ? 'learn_1' : 'select_lvl'),
        Markup.callbackButton('В профиль', 'back')],
    ]).resize().extra(),
  );
});

/** Ожиадем "learn_${lvl}", где lvl - уровень изучаемой магии */
magicScene.action(/magics|learn(?=_)/, async ({
  editMessageText, answerCbQuery, session, match,
}) => {
  const [, lvl] = match.input.split('_');
  if (lvl) {
    try {
      session.character = MagicService.learn(session.character.id, +lvl);
      answerCbQuery('Теперь ты знаешь на одну магию больше');
    } catch (e) {
      answerCbQuery(e.message);
    }
  }

  editMessageText(
    `Известные магии. Нажми на магию, чтобы узнать о ней больше.
${session.character.lvl === 1 ? `Стоимость изучения магии *1💡*(${session.character.bonus}💡)` : ''}`,
    {
      parse_mode: 'Markdown',
      reply_markup: Markup.inlineKeyboard([
        ...getMagicButtons(session.character),
        [
          Markup.callbackButton('Учить', session.character.lvl === 1 ? 'learn_1' : 'select_lvl'),
          Markup.callbackButton('В профиль', 'back'),
        ],
      ]).resize(),
    },
  );
});

magicScene.action('select_lvl', ({ editMessageText, session }) => {
  const lvl = Math.min(session.character.lvl, 4);

  editMessageText(
    `Выбери уровень изучаемой магии. Стоимость изучения равна уровню магии (*${session.character.bonus}💡*)`,
    {
      parse_mode: 'Markdown',
      reply_markup: Markup.inlineKeyboard([
        getLvlButtons(lvl),
        [
          Markup.callbackButton('Назад', 'magics'),
        ],
      ]).resize(),
    },
  );
});

/** Ожиадем "about_${name}", где name - название магии */
magicScene.action(/about(?=_)/, ({ editMessageText, match }) => {
  const [, name] = match.input.split('_');
  const magic = MagicService.show(name);
  editMessageText(
    `${magic.name}: ${magic.desc}`,
    Markup.inlineKeyboard([
      Markup.callbackButton('Назад', 'magics'),
    ]).resize().extra(),
  );
});

magicScene.action('back', ({ scene }) => {
  scene.enter('profile');
});

magicScene.hears('🔙 В лобби', ({ scene }) => {
  scene.enter('lobby');
});

module.exports = magicScene;
