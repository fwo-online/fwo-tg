/**
 * Сцена боя
 * Описание:
 */
const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');
const channelHelper = require('../helpers/channelHelper');
const arena = require('../arena');
const GameService = require('../arena/GameService');

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
  const { id } = session.character;
  const searchObject = { charId: id, psr: 1000, startTime: Date.now() };
  arena.mm.push(searchObject);
  await editMessageText(
    'Кнопки',
    Markup.inlineKeyboard([
      Markup.callbackButton('Нет-нет, остановите, я передумал!', 'stop'),
    ]).resize().extra(),
  );
  await channelHelper.broadcast(`Игрок ${global.arena.players[id].nickname} начал поиск игры`);
});

battleScene.action('stop', async ({ editMessageText, session }) => {
  // eslint-disable-next-line no-underscore-dangle
  const id = session.character._id;
  arena.mm.pull(id);
  editMessageText(
    'Кнопки',
    Markup.inlineKeyboard([
      Markup.callbackButton('Искать приключений на ...', 'search'),
    ]).resize().extra(),
  );
  await channelHelper.broadcast(`Игрок ${global.arena.players[id].nickname} внезапно передумал`);
});

battleScene.action(/action(?=_)/, async ({ editMessageText, session, match }) => {
  const gameId = global.arena.players[session.character.id].mm;
  const [, action] = match.input.split('_');
  const aliveArr = GameService.aliveArr(gameId).map(({ nick, id }) => Markup.callbackButton(nick, `${action}_${id}_${nick}`));
  editMessageText(
    `Выбери цель для ${match}`,
    Markup.inlineKeyboard([
      ...aliveArr,
    ]).resize().extra(),
  );
});

battleScene.action(/\w*_\w*_\w*/, async ({ editMessageText, session, match }) => {
  const [action, target, nick] = match.input.split('_');
  // eslint-disable-next-line no-underscore-dangle
  const gameId = global.arena.players[session.character.id].mm;
  const Game = global.arena.games[gameId];
  // eslint-disable-next-line no-underscore-dangle
  Game.orders.orderAction(session.character.id, target, action, 100);
  editMessageText(
    `Заказан ${action} на игрока ${nick}`,
  );
});

module.exports = battleScene;
