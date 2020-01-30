/**
 * Сцена боя
 * Описание:
 */
const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');
const channelHelper = require('../helpers/channelHelper');
const arena = require('../arena');
const GameService = require('../arena/GameService');
const { charDescr } = require('../arena/MiscService');
const { skills } = require('../arena/SkillService');
const loginHelper = require('../helpers/loginHelper');


const battleScene = new Scene('battleScene');

const penaltyTime = 180000;

/**
 * Проверяет можно ли игроку начать поиск
 * Если сделано слишком много попыток за заданное время, возвращает false
 * @param {Object} character - объект персонажа
 * @return {boolean}
 */
const checkCancelFindCount = (character) => {
  const time = Date.now();
  if (!character.mm) {
    character.mm = {
      time,
      try: 0,
    };
  }
  if (character.mm.try >= 3 && time - character.mm.time < penaltyTime) {
    return false;
  }
  character.mm.try += 1;
  character.mm.time = time;
  return true;
};

/**
 * Возвращает кнопки с процентом заказа
 * @param {string} match
 * @param {number} proc
 */
const getProcentKeyboard = (match, proc) => [100, 5, 10, 25, 50, 75]
  .filter((key) => key <= proc)
  .map((key) => Markup.callbackButton(key, `${match}_${key}`));

battleScene.enter(async ({ reply, replyWithMarkdown }) => {
  // @todo При поиске боя хотелось бы ещё выдавать сюда картиночку
  await replyWithMarkdown('*Поиск Боя*', Markup.removeKeyboard().extra());
  const message = await reply(
    'Кнопки',
    Markup.inlineKeyboard([
      [Markup.callbackButton('Искать приключений на ...', 'search')],
      [Markup.callbackButton('Назад', 'exit')],
    ]).resize().extra(),
  );
  channelHelper.messages[message.chat.id] = message.message_id;
});

battleScene.action('search', async ({ editMessageText, session }) => {
  const {
    id, mm, nickname, lvl, prof,
  } = session.character;
  if (!checkCancelFindCount(session.character)) {
    const remainingTime = ((penaltyTime - (Date.now() - mm.time)) / 1000).toFixed();
    await editMessageText(
      `Слишком много жмёшь кнопку, жди ${remainingTime} секунд до следующей попытки`,
      Markup.inlineKeyboard([
        [Markup.callbackButton('Искать приключений на ...', 'search')],
        [Markup.callbackButton('Назад', 'exit')],
      ]).resize().extra(),
    );
  } else {
    const searchObject = { charId: id, psr: 1000, startTime: Date.now() };
    const { icon } = Object.values(charDescr).find((el) => el.prof === prof);
    arena.mm.push(searchObject);
    await editMessageText(
      'Кнопки',
      Markup.inlineKeyboard([
        Markup.callbackButton('Нет-нет, остановите, я передумал!', 'stop'),
      ]).resize().extra(),
    );
    await channelHelper.broadcast(
      `Игрок *${nickname}* (${icon}${lvl}) начал поиск игры`,
    );
  }
});

battleScene.action('stop', async ({ editMessageText, session }) => {
  const { id } = session.character;
  arena.mm.pull(id);
  editMessageText(
    'Кнопки',
    Markup.inlineKeyboard([
      [Markup.callbackButton('Искать приключений на ...', 'search')],
      [Markup.callbackButton('Назад', 'exit')],
    ]).resize().extra(),
  );
  await channelHelper.broadcast(
    `Игрок ${arena.characters[id].nickname} внезапно передумал`,
  );
});

battleScene.action(/action(?=_)/, async ({ editMessageText, session, match }) => {
  const gameId = arena.characters[session.character.id].mm;
  const [, action] = match.input.split('_');
  const proc = skills[action] ? `_${skills[action].proc}` : '';
  const aliveArr = GameService.aliveArr(gameId)
    .map(({ nick, id }) => Markup.callbackButton(nick,
      `${action}_${id}${proc}`));
  editMessageText(
    `Выбери цель для ${match}`,
    Markup.inlineKeyboard([
      ...aliveArr,
    ]).resize().extra(),
  );
});

battleScene.action(/^([^_]+)_([^_]+)$/, async ({ editMessageText, session, match }) => {
  const [action, target] = match.input.split('_');
  const { id } = session.character;
  const gameId = arena.characters[id].mm;
  /** @type {GameService} */
  const Game = arena.games[gameId];
  const player = Game.players[id];
  editMessageText(
    `Выбери силу ${action} на игрока ${Game.players[target].nick}`,
    Markup.inlineKeyboard([
      ...getProcentKeyboard(match.input, player.proc),
    ]).resize().extra(),
  );
});

battleScene.action(/^([^_]+)_([^_]+)_([^_]+)$/, async ({ editMessageText, session, match }) => {
  const [action, target, proc] = match.input.split('_');
  const initiator = session.character.id;
  const gameId = arena.characters[initiator].mm;
  /** @type {GameService} */
  const Game = arena.games[gameId];
  const player = Game.players[initiator];
  Game.orders.orderAction({
    initiator, target, action, proc,
  });
  const { magics } = global.arena;
  const ACTIONS = { ...skills, ...magics };
  const message = Game.orders.ordersList
    .filter((o) => o.initiator === initiator)
    .map((o) => `\n_${ACTIONS[o.action].displayName}_ (*${o.proc}%*) на игрока *${Game.players[o.target].nick}*`);
  editMessageText(
    `У тебя осталось *${player.proc}%*
Заказы: ${message.join()}`,
    player.proc !== 0 ? {
      parse_mode: 'Markdown',
      reply_markup: Markup.inlineKeyboard(
        channelHelper.getOrderButtons(player),
      ).resize(),
    } : '',
  );
});

battleScene.action('exit', ({ scene }) => {
  scene.enter('lobby');
});

battleScene.command('run', async ({ reply, session }) => {
  const { id } = session.character;
  const gameId = arena.characters[id].mm;
  /** @type {GameService} */
  const Game = arena.games[gameId];

  Game.preKick(id, 'run');

  reply('Ты будешь выброшен из игры в конце этого раунда');
});

/**
 * Запус тестового боя
 */
battleScene.command('debug', async ({ reply, session }) => {
  // @todo сделать отдельный признак в базе
  const ADMINS = ['358539547', '187930249', '279139400', '371685623'];
  const { tgId } = session.character;
  if (!(ADMINS.indexOf(tgId) + 1)) {
    // test players: id 5e05ee58bdf83c6a5ff3f8dd, tgId: 123456789
    await loginHelper.getChar('123456789');
    const searchObject = { charId: '5e05ee58bdf83c6a5ff3f8dd', psr: 1000, startTime: Date.now() };
    arena.mm.push(searchObject);
    reply('ok');
  }
});

module.exports = battleScene;
