const Scene = require('telegraf/scenes/base');
const Stage = require('telegraf/stage');
const Markup = require('telegraf/markup');

const { leave } = Stage;
const profile = new Scene('profile');

profile.enter((ctx) => {
  ctx.reply(
    `Твой профиль, ${ctx.session.character.nickname}`,
    Markup.keyboard(['Навыки']).oneTime().resize().extra(),
  );
});

profile.hears('Характиристики', ({ reply, session }) => {
  const { str } = session.character;
  reply(
    'свободных очков "n"',
    Markup.inlineKeyboard([
      [{
        text: `str: ${str}`,
        callback_data: 'do_nothing',
      }],
      [{
        text: '-',
        callback_data: '-str',
      }],
      [{
        text: '+',
        callback_data: '+str',
      }],
    ]).resize().extra(),
  );
});

profile.action('+str', ({ session, editMessageText }) => {
  // console.log(ctx);
  const { str } = session.character;
  // ctx.editMessageText('Новый текст')
  editMessageText(
    'Свободных очков "n-1"',
    Markup.inlineKeyboard([
      [{
        text: `str: ${str - 1}`,
        callback_data: 'do_nothing',
      }],
      [{
        text: '-',
        callback_data: '-str',
      }],
      [{
        text: '+',
        callback_data: '+str',
      }],
    ]).resize().extra(),
  );
});

profile.command('exix', ({ scene }) => {
  leave();
  scene.enter('lobby');
});


module.exports = profile;
