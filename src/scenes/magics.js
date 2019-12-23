const Scene = require('telegraf/scenes/base');
const Stage = require('telegraf/stage');
const Markup = require('telegraf/markup');
const MagicService = require('../arena/MagicService');

const { leave } = Stage;
const magicScene = new Scene('magics');

const getMagicButtons = (character) => Object
  .keys(character.magics)
  .map((key) => [
    Markup.callbackButton(
      `${key}: ${character.magics[key]}`,
      `about_${key}`,
    ),
  ]);

magicScene.enter(async ({ replyWithMarkdown, reply, session }) => {
  await replyWithMarkdown(
    '*Магии*',
    Markup.keyboard([
      ['🔙 В лобби'],
    ]).resize().extra(),
  );

  await reply(
    `Известные магии. Нажми на магию, чтобы узнать больше. У тебя ${session.character.bonus} бонусов`,
    Markup.inlineKeyboard([
      ...getMagicButtons(session.character),
      [
        Markup.callbackButton('Учить', 'learn'),
        Markup.callbackButton('В профиль', 'back')],
    ]).resize().extra(),
  );
});

magicScene.action('learn', async ({ editMessageText, session }) => {
  try {
    session.character = {
      ...session.character, ...MagicService.learn(session.character.id, 1),
    };
    editMessageText(
      `Теперь ты знаешь на одну магию больше. У тебя ${session.character.bonus} бонусов`,
      Markup.inlineKeyboard([
        ...getMagicButtons(session.character),
        [
          Markup.callbackButton('Учить', 'learn'),
          Markup.callbackButton('В профиль', 'back'),
        ],
      ]).resize().extra(),
    );
  } catch (e) {
    editMessageText(
      `${e.message}`,
      Markup.inlineKeyboard([
        Markup.callbackButton('Назад', 'magics'),
      ]).resize().extra(),
    );
  }
});

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

magicScene.action('magics', async ({ editMessageText, session }) => {
  await editMessageText(
    `Известные магии. Нажми на магию, чтобы узнать больше. У тебя ${session.character.bonus} бонусов`,
    Markup.inlineKeyboard([
      ...getMagicButtons(session.character),
      [
        Markup.callbackButton('Учить', 'learn'),
        Markup.callbackButton('В профиль', 'back'),
      ],
    ]).resize().extra(),
  );
});

magicScene.action('back', ({ scene }) => {
  leave();
  scene.enter('profile');
});

magicScene.hears('🔙 В лобби', ({ scene }) => {
  leave();
  scene.enter('lobby');
});

module.exports = magicScene;
