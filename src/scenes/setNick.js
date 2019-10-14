const Scene = require('telegraf/scenes/base');
const Stage = require('telegraf/stage');
const loginHelper = require('../helpers/loginHelper');

const { leave } = Stage;
const setNick = new Scene('setNick');

async function valid(nickname) {
  if (nickname.length > 16) {
    throw new Error('Слишком длинный. Попробуй короче');
  } else if (nickname.length < 3) {
    throw new Error('Напрягись, ещё пару символов!');
  }

  const resp = await loginHelper.checkNick(nickname);
  if (resp) {
    throw new Error('Кто-то придумал это до тебя!');
  } else {
    return nickname;
  }
}

setNick.enter(({ reply, session }) => {
  reply(
    `Твой класс — ${session.character.prof}. Теперь нужно определиться с ником.
  Как будут звать тебя о великий воен?`,
  );
});

setNick.on('text', async ({
  from, reply, message, session, scene,
}) => {
  try {
    const tempNick = await valid(message.text);
    // eslint-disable-next-line no-param-reassign
    session.character.nickname = tempNick;
    await loginHelper.regChar(from.id, session.character.prof, session.character.nickname, 'm');
    leave();
    scene.enter('lobby');
  } catch (e) {
    reply(e.message);
  }
});

module.exports = setNick;
