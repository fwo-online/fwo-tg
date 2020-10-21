/**
 * Сцена боя
 * Описание:
 */
const { BaseScene, Markup } = require('telegraf');
const arena = require('../arena');
const BattleService = require('../arena/BattleService');
const { getIcon } = require('../arena/MiscService');
const channelHelper = require('../helpers/channelHelper');
const loginHelper = require('../helpers/loginHelper');

/** @type {import('./stage').BaseGameScene} */
const battleScene = new BaseScene('battleScene');

const penaltyTime = 180000;

/**
 * @param {import('./stage').BaseGameContext} ctx
 * @param {(ctx: import('./stage').BaseGameContext) => void} orderFn
 */
const catchOrderError = (ctx, orderFn) => {
  try {
    orderFn(ctx);
  } catch (e) {
    console.log(e);
    const { answerCbQuery, session, editMessageText } = ctx;
    answerCbQuery(e.message);
    const { currentGame, id } = session.character;
    const [message, keyboard] = BattleService.getDefaultMessage(id, currentGame);
    editMessageText(
      message,
      Markup.inlineKeyboard(
        keyboard,
      ).resize().extra({ parse_mode: 'Markdown' }),
    );
  }
};

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
    'Начать поиск',
    Markup.inlineKeyboard([
      [Markup.callbackButton('Искать приключений на ...', 'search')],
      [Markup.callbackButton('Назад', 'exit')],
    ]).resize().extra(),
  );
  channelHelper.messages[message.chat.id] = message.message_id;
});

battleScene.action('search', async ({ editMessageText, session }) => {
  const {
    id, mm, nickname, lvl, prof, clan,
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
    arena.mm.push(searchObject);
    await editMessageText(
      'Идёт поиск игры...',
      Markup.inlineKeyboard([
        Markup.callbackButton('Нет-нет, остановите, я передумал!', 'stop'),
      ]).resize().extra(),
    );
    await channelHelper.broadcast(
      `Игрок ${clan ? `\\[${clan.name}]` : ''} *${nickname}* (${getIcon(prof)}${lvl}) начал поиск игры`,
    );
  }
});

battleScene.action('stop', async ({ editMessageText, session }) => {
  const { id, nickname, clan } = session.character;
  arena.mm.pull(id);
  editMessageText(
    'Начать поиск',
    Markup.inlineKeyboard([
      [Markup.callbackButton('Искать приключений на ...', 'search')],
      [Markup.callbackButton('Назад', 'exit')],
    ]).resize().extra(),
  );
  await channelHelper.broadcast(
    `Игрок ${clan ? `\\[${clan.name}]` : ''} *${nickname}* внезапно передумал`,
  );
});

/**
 * Ожидаем строку 'action_{attack}'
 */
battleScene.action(/action(?=_)/, (ctx) => {
  catchOrderError(ctx, ({ match, session, editMessageText }) => {
    const { currentGame, id } = session.character;
    const [, action] = match.input.split('_');
    const [message, keyboard] = BattleService.handleAction(id, currentGame, action);
    editMessageText(
      message,
      Markup.inlineKeyboard(
        keyboard,
      ).resize().extra({ parse_mode: 'Markdown' }),
    );
  });
});

/**
 * Ожидаем строку '{attack}_{target}'
 */
battleScene.action(/^([^_]+)_([^_]+)$/, (ctx) => {
  catchOrderError(ctx, ({ editMessageText, session, match }) => {
    const [action, target] = match.input.split('_');
    const { id, currentGame } = session.character;
    const [message, keyboard] = BattleService.handleTarget(id, currentGame, action, target);
    editMessageText(
      message,
      Markup.inlineKeyboard(
        keyboard,
      ).resize().extra({ parse_mode: 'Markdown' }),
    );
  });
});

/**
 * Ожидаем строку '{attack}_{target}_{proc}'
 */
battleScene.action(/^([^_]+)_([^_]+)_([^_]+)$/, (ctx) => {
  catchOrderError(ctx, ({ editMessageText, session, match }) => {
    const [action, target, proc] = match.input.split('_');
    const { id, currentGame } = session.character;
    const [message, keyboard] = BattleService.handlePercent(
      id, currentGame, action, target, Number(proc),
    );
    editMessageText(
      message,
      Markup.inlineKeyboard(
        keyboard,
      ).resize().extra({ parse_mode: 'Markdown' }),
    );
  });
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
  const ADMINS = [358539547, 187930249, 279139400, 371685623];
  const { tgId } = session.character;
  if (ADMINS.indexOf(tgId) !== -1) {
    // test players: tgId: 123456789
    const char = await loginHelper.getChar(123456789);
    const searchObject = { charId: char.id, psr: 1000, startTime: Date.now() };
    arena.mm.push(searchObject);
    reply('ok');
  }
});

module.exports = battleScene;
