const { BaseScene } = require('telegraf');
const { charDescr } = require('../../arena/MiscService');
const keyboards = require('./keyboards');
const messages = require('./messages');

/** @type {import('../stage').BaseGameScene} */
const create = new BaseScene('create');

create.enter(async ({ reply }) => reply(
  messages.enter,
  keyboards.create,
));

create.action('create', ({ editMessageText }) => {
  editMessageText(
    messages.create,
    keyboards.profButtons,
  );
});

create.action(/select(?=_)/, ({ editMessageText, session, match }) => {
  const [, prof] = match.input.split('_');
  const { name } = charDescr[prof];

  session.prof = name;
  editMessageText(
    messages.select(prof),
    keyboards.select,
  );
});

create.action('select', async ({ editMessageText, scene }) => {
  await editMessageText(messages.selectDone, keyboards.empty);
  scene.enter('setNick');
});

create.action('back', async ({ editMessageText }) => {
  await editMessageText(
    messages.back,
    keyboards.profButtons,
  );
});

module.exports = create;
