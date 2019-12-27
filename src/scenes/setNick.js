const Scene = require('telegraf/scenes/base');
const loginHelper = require('../helpers/loginHelper');

const setNick = new Scene('setNick');

/**
 * Валидация ника
 * @param {string} nickname
 */
async function valid(nickname) {
  const trimNickname = nickname.trim();
  if (trimNickname.length > 16) {
    throw new Error('Слишком длинный. Попробуй короче');
  } else if (trimNickname.length < 3) {
    throw new Error('Напрягись, ещё пару символов!');
  } else if (trimNickname.charAt(0) === '/') {
    throw new Error('Запрещено начинать ник с "/" ');
  } else if (trimNickname.includes('_')) {
    throw new Error('Запрещено использовать "_" в нике');
  }

  const resp = await loginHelper.checkNick(trimNickname);
  if (resp) {
    throw new Error('Кто-то придумал это до тебя!');
  } else {
    return trimNickname;
  }
}

setNick.enter(({ reply, session }) => {
  reply(
    `Твой класс — ${session.prof}. Теперь нужно определиться с ником. Как будут звать тебя о великий воен?`,
  );
});

setNick.on('text', async ({
  from, reply, message, session, scene,
}) => {
  try {
    const nickname = await valid(message.text);
    await loginHelper.regChar(from.id, session.prof, nickname, 'm');
    session.character = await loginHelper.getChar(from.id);
    scene.enter('lobby');
  } catch (e) {
    await reply(e.message);
    scene.enter('greeter');
  }
});

module.exports = setNick;
