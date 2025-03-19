import type { Middleware } from 'telegraf';
import type { BotContext } from '../fwo';

export function restartMiddleware(): Middleware<BotContext> {
  return async (ctx, next) => {
    if (!Object.keys(ctx.session.__scenes ?? {}).length) {
      await ctx.scene.enter('greeter');
    }
    await next();
  };
}
