import type { Middleware } from 'telegraf';
import type { BotContext } from '../fwo';

export function restartMiddleware(): Middleware<BotContext> {
  return (ctx, next) => {
    if (!Object.keys(ctx.session.__scenes).length) {
      ctx.scene.enter('greeter');
    }
    next();
  };
}
