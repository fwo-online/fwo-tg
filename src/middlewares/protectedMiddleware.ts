import type { Middleware } from 'telegraf';
import type { BotContext } from '../fwo';

export function protectedMiddleware(): Middleware<BotContext> {
  return (ctx, next) => {
    if (!ctx.session.character) {
      return;
    }
    next();
  };
}
