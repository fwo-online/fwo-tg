const Scene = require('telegraf/scenes/base');
const Stage = require('telegraf/stage');
const Markup = require('telegraf/markup');

const { leave } = Stage;
const profile = new Scene('profile');

profile.enter(({ reply, session }) => {
  reply(
    `Твой профиль, ${session.character.nickname}`,
    Markup.keyboard(['Характеристики']).oneTime().resize().extra(),
  );
});

profile.hears('Характеристики', ({ reply, session }) => {
  const { free, str } = session.character;
  reply(
    `Свободных очков ${free}`,
    Markup.inlineKeyboard([
      [[{
        text: `Сила: ${str}`,
        callback_data: 'do_nothing',
      }]],
      [[{
        text: '-',
        callback_data: 'decrease_str',
      }],
      [{
        text: '+',
        callback_data: 'increase_str',
      }]],
    ]).resize().extra(),
  );
});

profile.action(/increase(?=_)/, ({ session, editMessageText, match }) => {
  const [, hark] = match.input.split('_');
  // eslint-disable-next-line no-param-reassign
  session.character.str += 1;
  // eslint-disable-next-line no-param-reassign
  session.character.free -= 1;
  editMessageText(
    `Свободных очков ${session.character.free}`,
    Markup.inlineKeyboard([
      [{
        text: `Сила: ${session.character.str}`,
        callback_data: 'do_nothing',
      }],
      [{
        text: '-',
        callback_data: `decrease_${hark}`,
      }],
      [{
        text: '+',
        callback_data: `increase_${hark}`,
      }],
    ]).resize().extra(),
  );
});

profile.action(/decrease(?=_)/, ({ session, editMessageText, match }) => {
  const [, hark] = match.input.split('_');
  // eslint-disable-next-line no-param-reassign
  session.character.str -= 1;
  // eslint-disable-next-line no-param-reassign
  session.character.free += 1;
  editMessageText(
    `Свободных очков ${session.character.free}`,
    Markup.inlineKeyboard([
      [{
        text: `Сила: ${session.character.str}`,
        callback_data: 'do_nothing',
      }],
      [{
        text: '-',
        callback_data: `decrease_${hark}`,
      }],
      [{
        text: '+',
        callback_data: `increase_${hark}`,
      }],
    ]).resize().extra(),
  );
});

profile.command('exix', ({ scene }) => {
  leave();
  scene.enter('lobby');
});


module.exports = profile;
