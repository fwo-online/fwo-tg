/**
 * Сцена боя
 * Описание:
 */
const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');
const channelHelper = require('../helpers/channelHelper');
const Char = require('../arena/CharacterService');
const arena = require('../arena');
const Orders = require('../arena/OrderService');
const GameService = require('../arena/GameService');

const orders = new Orders();

const battleScene = new Scene('battleScene');
battleScene.enter(({ reply }) => {
  reply(
    'Кнопки',
    Markup.inlineKeyboard([
      Markup.callbackButton('Искать приключений на ...', 'search'),
    ]).resize().extra(),
  );
});

battleScene.action('search', async ({ reply, session }) => {
  // eslint-disable-next-line no-underscore-dangle
  await Char.loading(session.character._id);

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(global.arena));
  // eslint-disable-next-line no-underscore-dangle
  const searchObject = { charId: session.character._id, psr: 1000, startTime: Date.now() };
  arena.mm.push(searchObject);
  await reply('Мессага в личный чат');
  await channelHelper.broadcast('Мессага в общий чат');
});

battleScene.action(/action(?=_)/, async ({ editMessageText, session, match }) => {
  // eslint-disable-next-line no-underscore-dangle
  const gameId = global.arena.players[session.character._id].mm;
  const [, action] = match.input.split('_');
  const aliveArr = GameService.aliveArr(gameId).map(({ nick, id }) => Markup.callbackButton(nick, `${action}_${id}_${nick}`));
  editMessageText(
    `Выбери цель для ${match} 100%`,
    Markup.inlineKeyboard([
      ...aliveArr,
    ]).resize().extra(),
  );
});

battleScene.action(/\w*_\w*_\w*/, async ({ editMessageText, session, match }) => {
  const [action, target, nick] = match.input.split('_');
  // eslint-disable-next-line no-underscore-dangle
  orders.orderAction(session.character._id, target, action, 100);
  editMessageText(
    `Заказан ${action} на игрока ${nick}`,
  );
});

module.exports = battleScene;
