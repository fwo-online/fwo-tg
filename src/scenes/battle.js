/**
 * Сцена боя
 * Описание:
 */
const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');
const channelHelper = require('../helpers/channelHelper');
const arena = require('../arena');
const { charDescr } = require('../arena/MiscService');
const loginHelper = require('../helpers/loginHelper');
const BattleService = require('../arena/BattleService');


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
  arena.mm.pull(session.character.id);
  editMessageText(
    'Кнопки',
    Markup.inlineKeyboard([
      [Markup.callbackButton('Искать приключений на ...', 'search')],
      [Markup.callbackButton('Назад', 'exit')],
    ]).resize().extra(),
  );
  await channelHelper.broadcast(
    `Игрок ${session.character.nickname} внезапно передумал`,
  );
});

battleScene.action(/action(?=_)/, async ({ editMessageText, session, match }) => {
  const { currentGame, id } = session.character;
  const [, action] = match.input.split('_');

  if (action === 'repeat' || action === 'reset') {
    const player = currentGame.players[id];
    if (action === 'repeat') {
      BattleService.repeatOrder(id, currentGame);
    } else if (action === 'reset') {
      BattleService.resetOrder(id, currentGame);
    }
    editMessageText(
      `У тебя осталось *${player.proc}%*
Заказы: ${BattleService.getCurrentOrders(id, currentGame)}`,
      Markup.inlineKeyboard(
        channelHelper.getOrderButtons(player),
      ).resize().extra({ parse_mode: 'Markdown' }),
    );
  } else {
    editMessageText(
      `Выбери цель для ${BattleService.getActions()[action].displayName}`,
      Markup.inlineKeyboard([
        ...BattleService.getTargetButtons(id, currentGame, action),
      ]).resize().extra(),
    );
  }
});

battleScene.action(/^([^_]+)_([^_]+)$/, async ({ editMessageText, session, match }) => {
  const [action, target] = match.input.split('_');
  const { id, currentGame } = session.character;
  const player = currentGame.players[id];
  editMessageText(
    `Выбери силу ${BattleService.getActions()[action].displayName} на игрока ${currentGame.players[target].nick}`,
    Markup.inlineKeyboard([
      ...BattleService.getProcentKeyboard(match.input, player.proc),
    ]).resize().extra(),
  );
});

battleScene.action(/^([^_]+)_([^_]+)_([^_]+)$/, async ({ editMessageText, session, match }) => {
  const [action, target, proc] = match.input.split('_');
  const { id, currentGame } = session.character;
  const player = currentGame.players[id];
  currentGame.orders.orderAction({
    initiator: id, target, action, proc,
  });

  editMessageText(
    `У тебя осталось *${player.proc}%*
Заказы: ${BattleService.getCurrentOrders(id, currentGame)}`,
    Markup.inlineKeyboard(
      channelHelper.getOrderButtons(player),
    ).resize().extra({ parse_mode: 'Markdown' }),
  );
});

battleScene.action('exit', ({ scene }) => {
  scene.enter('lobby');
});

battleScene.command('run', async ({ reply, session }) => {
  const { id, currentGame } = session.character;

  currentGame.preKick(id, 'run');

  reply('Ты будешь выброшен из игры в конце этого раунда');
});

battleScene.leave(({ session }) => {
  arena.mm.pull(session.character.id);
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
