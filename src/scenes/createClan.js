const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');
const db = require('../helpers/dataBase');

const createClanScene = new Scene('createClan');

/**
 * Валидация названия клана
 * @param {string} name
 */
async function valid(name) {
  const trimName = name.trim();
  if (trimName.length > 16) {
    throw new Error('Слишком длинное название. Попробуй короче');
  } else if (trimName.length < 3) {
    throw new Error('Напрягись, ещё пару символов!');
  } else if (trimName.charAt(0) === '/') {
    throw new Error('Запрещено начинать клан с "/" ');
  }

  const resp = await db.clan.findName(trimName);
  if (resp) {
    throw new Error('Кто-то придумал это до тебя!');
  } else {
    return trimName;
  }
}

createClanScene.enter(async ({ reply, session }) => {
  reply(
    `Стоимость создания клана: 100💰.
${session.character.clan ? 'Сначала тебе нужно покинуть свой клан' : 'Введи название клана'}`,
    Markup.inlineKeyboard([
      Markup.callbackButton('Назад', 'back'),
    ]).resize().extra(),
  );
});

createClanScene.hears('🔙 В лобби', ({ scene }) => {
  scene.enter('lobby');
});

createClanScene.on('text', async ({
  message, session, reply, scene,
}) => {
  try {
    const clanName = await valid(message.text);
    const char = await session.character.createClan(clanName);
    session.character = char;
    scene.enter('clan');
  } catch (e) {
    await reply(e.message);
  }
});

createClanScene.action('back', ({ scene }) => {
  scene.enter('clan');
});

module.exports = createClanScene;
