const Scene = require('telegraf/scenes/base');
const Stage = require('telegraf/stage');
const Markup = require('telegraf/markup');
const loginHelper = require('../helpers/loginHelper');

const { leave } = Stage;
const setNick = new Scene('setNick');

async function valid(nickname) {
  if (nickname.length > 16) {
    throw new Error('Слишком длинный. Попробуй короче');
  } else if (nickname.length < 3) {
    throw new Error('Напрягись, ещё пару символов!');
  }

  try {
    const resp = await loginHelper.checkNick(nickname);
    if (resp) {
      throw new Error('Кто-то придумал это до тебя!');
    } else {
      return nickname;
    }
  } catch (e) {
    throw new Error('Упс, что-то сломалось. Попробуй ещё раз');
  }
}

setNick.enter(async ({ reply }) => {
  reply('Как будут звать тебя о великий воен?');
});

setNick.on('text', async ({ from, reply, message, session, scene }) => {
  try {
    const tempNick = await valid(message.text);
    // eslint-disable-next-line no-param-reassign
    session.charNick = tempNick;
    await loginHelper.regChar(from.id, session.charProf, session.charNick, 'm');
    reply(`Так так, значит ты "${session.charNick}"`);

    leave();
    scene.enter('lobby');
  } catch (e) {
    reply(e.message);
  }
});

module.exports = setNick;
