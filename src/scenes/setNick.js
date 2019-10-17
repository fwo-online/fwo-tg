const Scene = require('telegraf/scenes/base');
const Stage = require('telegraf/stage');
const loginHelper = require('../helpers/loginHelper');

const { leave } = Stage;
const setNick = new Scene('setNick');

async function valid(nickname) {
  const trimNickname = nickname;
  if (trimNickname.length > 16) {
    throw new Error('Слишком длинный. Попробуй короче');
  } else if (trimNickname.length < 3) {
    throw new Error('Напрягись, ещё пару символов!');
  } else if (trimNickname.charAt(0) === '/') {
    throw new Error('Запрещено начинать ник с "/" ');
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
    `Твой класс — ${session.character.prof}. Теперь нужно определиться с ником. Как будут звать тебя о великий воен?`,
  );
});

setNick.on('text', async ({
  from, reply, message, session, scene,
}) => {
  try {
    const nickname = await valid(message.text);
    // eslint-disable-next-line no-param-reassign
    session.character = await loginHelper.regChar(from.id, session.character.prof, nickname, 'm');
    leave();
    scene.enter('lobby');
  } catch (e) {
    await reply(e.message);
    leave();
    scene.enter('greeter');
  }
});

module.exports = setNick;
