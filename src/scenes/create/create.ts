import { Scenes } from 'telegraf';
import type { Prof } from '../../data/profs';
import type { BotContext } from '../../fwo';
import loginHelper from '../../helpers/loginHelper';
import { keyboards } from './keyboards';
import { messages } from './messages';

type CreateBotContext = BotContext & {
  session: {
    prof: Prof;
    hearNick: boolean;
  }
}

/**
 * Валидация ника
 * @param nickname
 */
async function validNickname(nickname: string) {
  const trimNickname = nickname.trim();
  if (trimNickname.length > 16) {
    throw new Error('Слишком длинный. Попробуй короче');
  } else if (trimNickname.length < 3) {
    throw new Error('Напрягись, ещё пару символов!');
  } else if (trimNickname.charAt(0) === '/') {
    throw new Error('Запрещено начинать ник с "/" ');
  } else if (trimNickname.includes('_')) {
    throw new Error('Запрещено использовать "_" в нике');
  }

  const resp = await loginHelper.checkNick(trimNickname);
  if (resp) {
    throw new Error('Кто-то придумал это до тебя!');
  } else {
    return trimNickname;
  }
}

export const create = new Scenes.BaseScene<CreateBotContext>('create');

create.enter((ctx) => {
  ctx.session.hearNick = false;
  ctx.reply(
    messages.enter,
    keyboards.create,
  );
});

create.action('create', (ctx) => {
  ctx.editMessageText(
    messages.create,
    keyboards.profButtons,
  );
});

create.action(/select(?=_)/, (ctx) => {
  const [, prof] = ctx.match.input.split('_') as [string, Prof];

  ctx.session.hearNick = true;
  ctx.session.prof = prof;
  ctx.editMessageText(
    messages.select(prof),
    keyboards.back,
  );
});

create.on('text', async (ctx) => {
  if (!ctx.from) {
    ctx.scene.enter('greeter');
    return;
  }

  if (!ctx.session.hearNick) {
    return;
  }

  try {
    const nickname = await validNickname(ctx.message.text);
    await loginHelper.regChar(ctx.from?.id, ctx.session.prof, nickname, 'm');
    ctx.session.character = await loginHelper.getChar(ctx.from?.id);
    ctx.scene.enter('lobby');
    ctx.session.hearNick = false;
  } catch (e) {
    ctx.reply(e.message);
  }
});

create.action('back', async (ctx) => {
  ctx.session.hearNick = false;
  await ctx.editMessageText(
    messages.back,
    keyboards.profButtons,
  );
});
