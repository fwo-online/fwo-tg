import type { Middleware } from 'telegraf';
import type { BotContext } from '../fwo';

export function chatMiddleware(): Middleware<BotContext> {
  return (ctx, next) => {
    if (ctx.chat && ctx.chat.type !== 'private') {
      return;
    }
    return next();
  };
}
