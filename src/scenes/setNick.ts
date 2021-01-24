import { Scenes } from 'telegraf';
import { profs } from '../data/profs';
import loginHelper from '../helpers/loginHelper';
import type { CreateBotContext } from './create/create';

export const setNick = new Scenes.BaseScene<CreateBotContext>('setNick');

/**
 * Валидация ника
 * @param {string} nickname
 */
async function valid(nickname) {
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

setNick.enter((ctx) => {
  ctx.reply(
    `Твой класс — ${profs[ctx.session.prof].name}. Теперь нужно определиться с ником. Как будут звать тебя о великий воен?`,
  );
});

setNick.on('text', async (ctx) => {
  if (!ctx.from) {
    ctx.scene.enter('greeter');
    return;
  }
  try {
    const nickname = await valid(ctx.message.text);
    await loginHelper.regChar(ctx.from?.id, ctx.session.prof, nickname, 'm');
    ctx.session.character = await loginHelper.getChar(ctx.from?.id);
    ctx.scene.enter('lobby');
  } catch (e) {
    await ctx.reply(e.message);
    ctx.scene.enter('greeter');
  }
});
