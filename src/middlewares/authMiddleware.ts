import type { Middleware } from 'telegraf';
import type { BotContext } from '../fwo';
import * as loginHelper from '../helpers/loginHelper';

export function authMiddleware(): Middleware<BotContext> {
  return async (ctx, next) => {
    if (!ctx.session.character && ctx.chat?.type === 'private') {
      const character = await loginHelper.getChar(ctx.chat.id);
      if (character) {
        ctx.session.character = character;
      }
    }
    return next();
  };
}
