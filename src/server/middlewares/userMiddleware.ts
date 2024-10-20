import type { User } from '@telegram-apps/init-data-node';
import { parse, validate } from '@telegram-apps/init-data-node';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';

export const userMiddleware = createMiddleware<{ Variables:{ user: User }}>(async (c, next) => {
  const authorization = c.req.header('authorization');
  const [type, token] = authorization?.split(' ') ?? [];

  if (type === 'tma') {
    validate(token, process.env.BOT_TOKEN ?? '');
    const { user } = parse(token);
    if (!user) {
      return c.notFound();
    }
    c.set('user', user);
  } else {
    throw new HTTPException(401);
  }

  await next();
});
