const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');
const MagicService = require('../arena/MagicService');

const magicScene = new Scene('magics');

const getMagicButtons = (character) => Object
  .keys(character.magics)
  .map((key) => [
    Markup.callbackButton(
      `${MagicService.magics[key].displayName}: ${character.magics[key]}`,
      `about_${key}`,
    ),
  ]);

magicScene.enter(async ({ replyWithMarkdown, session }) => {
  await replyWithMarkdown(
    '*Магии*',
    Markup.keyboard([
      ['🔙 В лобби'],
    ]).resize().extra(),
  );

  await replyWithMarkdown(
    `Известные магии. Нажми на магию, чтобы узнать о ней больше.
Стоимость изучения магии *1💡*(${session.character.bonus}💡) ${session.character.bonus === 0 ? '❗️' : '✅'}`,
    Markup.inlineKeyboard([
      ...getMagicButtons(session.character),
      [
        Markup.callbackButton('Учить', 'learn'),
        Markup.callbackButton('В профиль', 'back')],
    ]).resize().extra(),
  );
});

magicScene.action('learn', async ({ editMessageText, answerCbQuery, session }) => {
  try {
    session.character = MagicService.learn(session.character.id, 2);
    answerCbQuery('Теперь ты знаешь на одну магию больше');
  } catch (e) {
    answerCbQuery(e.message);
  }
  editMessageText(
    `Известные магии. Нажми на магию, чтобы узнать о ней больше.
Стоимость изучения магии *1💡*(${session.character.bonus}💡) ${session.character.bonus === 0 ? '❗️' : '✅'}`,
    {
      parse_mode: 'Markdown',
      reply_markup: Markup.inlineKeyboard([
        ...getMagicButtons(session.character),
        [
          Markup.callbackButton('Учить', 'learn'),
          Markup.callbackButton('В профиль', 'back'),
        ],
      ]).resize(),
    },
  );
});

magicScene.action(/about(?=_)/, ({ editMessageText, match }) => {
  const [, name] = match.input.split('_');
  const magic = MagicService.show(name);
  editMessageText(
    `${magic.name}: ${magic.desc}`,
    Markup.inlineKeyboard([
      Markup.callbackButton('Назад', 'magics'),
    ]).resize(),
  );
});

magicScene.action('magics', async ({ editMessageText, session }) => {
  await editMessageText(
    `Известные магии. Нажми на магию, чтобы узнать о ней больше.
Стоимость изучения магии *1💡*(${session.character.bonus}💡) ${session.character.bonus === 0 ? '❗️' : '✅'}`,
    {
      parse_mode: 'Markdown',
      reply_markup: Markup.inlineKeyboard([
        ...getMagicButtons(session.character),
        [
          Markup.callbackButton('Учить', 'learn'),
          Markup.callbackButton('В профиль', 'back'),
        ],
      ]).resize(),
    },
  );
});

magicScene.action('back', ({ scene }) => {
  scene.enter('profile');
});

magicScene.hears('🔙 В лобби', ({ scene }) => {
  scene.enter('lobby');
});

module.exports = magicScene;
