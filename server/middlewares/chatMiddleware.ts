import type { Middleware } from 'grammy';

export function chatMiddleware(): Middleware {
  return (ctx, next) => {
    if (ctx.chat && ctx.chat.type !== 'private') {
      return;
    }
    return next();
  };
}
