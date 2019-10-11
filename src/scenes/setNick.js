const Scene = require('telegraf/scenes/base');
const Stage = require('telegraf/stage');
const Markup = require('telegraf/markup');

const { leave } = Stage;
const setNick = new Scene('setNick');

async function valid(nick) {
  return nick;
}

setNick.enter(async ({ reply }) => {
  reply('Как будут звать тебя о великий воен?');
});

setNick.on('text', async ({ reply, message, session }) => {
  try {
    const tmpNick = message.text;
    session.nickname = valid(tmpNick);
    reply(
      `Так так, значит ты "${session.nickname}"`,
      Markup.keyboard(['Далее', 'Назад']).oneTime().resize().extra(),
    );
  } catch (e) {
    reply('так себе ты придумал, давай ещё разок');
  }
});
setNick.hears('Далее', async ({ scene, session }) => {
  if (session.nickname) {
    leave();
    scene.enter('lobby');
  }
});
module.exports = setNick;
