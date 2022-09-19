import type { Middleware } from 'telegraf';
import type { BotContext } from '../fwo';

export function protectedMiddleware(): Middleware<BotContext> {
  return async (ctx, next) => {
    if (!ctx.session.character) {
      return;
    }
    await next();
  };
}
