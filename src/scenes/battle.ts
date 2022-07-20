/**
 * Сцена боя
 * Описание:
 */
import { Scenes, Markup } from 'telegraf';
import arena from '../arena';
import * as BattleService from '../arena/BattleService';
import OrderError from '../arena/errors/OrderError';
import { Profs } from '../data';
import type { BotContext } from '../fwo';
import * as channelHelper from '../helpers/channelHelper';
import loginHelper from '../helpers/loginHelper';

export const battleScene = new Scenes.BaseScene<BotContext>('battleScene');

const penaltyTime = 180000;

type OrderFn = (ctx: BotContext) => void;

const catchOrderError = (ctx: BotContext, orderFn: OrderFn) => {
  try {
    orderFn(ctx);
  } catch (e) {
    if (e instanceof OrderError) {
      ctx.answerCbQuery(e.message);
      const { currentGame, id } = ctx.session.character;
      const { message, keyboard } = BattleService.getDefaultMessage(id, currentGame);
      ctx.editMessageText(
        message,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard(keyboard),
        },
      );
    } else {
      throw e;
    }
  }
};

/**
 * Проверяет можно ли игроку начать поиск
 * Если сделано слишком много попыток за заданное время, возвращает false
 * @param character - объект персонажа
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

battleScene.enter(async (ctx) => {
  // @todo При поиске боя хотелось бы ещё выдавать сюда картиночку
  await ctx.replyWithMarkdown('*Поиск Боя*', Markup.removeKeyboard());
  ctx.session.character.resetExpLimit();
  const canStartSearch = ctx.session.character.expEarnedToday < ctx.session.character.expLimitToday;
  const message = await ctx.reply(
    canStartSearch ? 'Начать поиск' : 'Достигнут лимит опыта на сегодня',
    Markup.inlineKeyboard([
      [Markup.button.callback('Искать приключений на ...', 'search', !canStartSearch)],
      [Markup.button.callback('Назад', 'exit')],
    ]),
  );
  channelHelper.setMessage(message.chat.id, message.message_id);
});

battleScene.action('search', async (ctx) => {
  const {
    id, mm, nickname, lvl, prof, clan,
  } = ctx.session.character;
  if (!checkCancelFindCount(ctx.session.character)) {
    const remainingTime = ((penaltyTime - (Date.now() - mm.time)) / 1000).toFixed();
    await ctx.editMessageText(
      `Слишком много жмёшь кнопку, жди ${remainingTime} секунд до следующей попытки`,
      Markup.inlineKeyboard([
        [Markup.button.callback('Искать приключений на ...', 'search')],
        [Markup.button.callback('Назад', 'exit')],
      ]),
    );
  } else {
    const searchObject = { charId: id, psr: 1000, startTime: Date.now() };
    arena.mm.push(searchObject);
    await ctx.editMessageText(
      'Идёт поиск игры...',
      Markup.inlineKeyboard([
        Markup.button.callback('Нет-нет, остановите, я передумал!', 'stop'),
      ]),
    );
    await channelHelper.broadcast(
      `Игрок ${clan ? `\\[${clan.name}] ` : ''}*${nickname}* (${Profs.profsData[prof].icon}${lvl}) начал поиск игры`,
    );
  }
});

battleScene.action('stop', async (ctx) => {
  const { id, nickname, clan } = ctx.session.character;
  const canStartSearch = ctx.session.character.expEarnedToday < ctx.session.character.expLimitToday;
  arena.mm.pull(id);
  ctx.editMessageText(
    canStartSearch ? 'Начать поиск' : 'Достигнут лимит опыта на сегодня',
    Markup.inlineKeyboard([
      [Markup.button.callback('Искать приключений на ...', 'search', !canStartSearch)],
      [Markup.button.callback('Назад', 'exit')],
    ]),
  );
  await channelHelper.broadcast(
    `Игрок ${clan ? `\\[${clan.name}]` : ''} *${nickname}* внезапно передумал`,
  );
});

battleScene.action('back', async (ctx) => {
  const { currentGame, id } = ctx.session.character;
  const { message, keyboard } = BattleService.getDefaultMessage(id, currentGame);
  await ctx.editMessageText(
    message,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(keyboard),
    },
  );
});

/**
 * Ожидаем строку 'action_{attack}'
 */
battleScene.action(/action(?=_)/, (ctx) => {
  catchOrderError(ctx, () => {
    const { currentGame, id } = ctx.session.character;
    const [, action] = ctx.match.input.split('_');
    const { message, keyboard } = BattleService.handleAction(id, currentGame, action);
    ctx.editMessageText(
      message,
      {
        ...Markup.inlineKeyboard(keyboard),
        parse_mode: 'Markdown',
      },
    );
  });
});

/**
 * Ожидаем строку '{attack}_{target}'
 */
battleScene.action(/^([^_]+)_([^_]+)$/, (ctx) => {
  catchOrderError(ctx, () => {
    const [action, target] = ctx.match.input.split('_');
    const { id, currentGame } = ctx.session.character;
    const { message, keyboard } = BattleService.handleTarget(id, currentGame, action, target);
    ctx.editMessageText(
      message,
      {
        ...Markup.inlineKeyboard(keyboard),
        parse_mode: 'Markdown',
      },
    );
  });
});

/**
 * Ожидаем строку '{attack}_{target}_{proc}'
 */
battleScene.action(/^([^_]+)_([^_]+)_(\d{1,2}|100)$/, (ctx) => {
  catchOrderError(ctx, () => {
    const [action, target, proc] = ctx.match.input.split('_');
    const { id, currentGame } = ctx.session.character;
    const {
      message,
      keyboard,
    } = BattleService.handlePercent(id, currentGame, action, target, Number(proc));
    // console.log()
    ctx.editMessageText(
      message,

      {
        ...Markup.inlineKeyboard(keyboard),
        parse_mode: 'Markdown',
      },
    );
  });
});

battleScene.action('exit', (ctx) => {
  ctx.scene.enter('lobby');
});

battleScene.command('run', async (ctx) => {
  const { id, currentGame } = ctx.session.character;

  currentGame.preKick(id, 'run');

  ctx.reply('Ты будешь выброшен из игры в конце этого раунда');
});

battleScene.leave((ctx) => {
  arena.mm.pull(ctx.session.character.id);
});

if (process.env.NODE_ENV === 'development') {
  /**
   * Запуск тестового боя
   */
  battleScene.command('debug', async (ctx) => {
    // test players: tgId: 123456789
    const char = await loginHelper.getChar(123456789);
    const searchObject = { charId: char.id, psr: 1000, startTime: Date.now() };
    arena.mm.push(searchObject);
    ctx.reply('ok');
  });
}
