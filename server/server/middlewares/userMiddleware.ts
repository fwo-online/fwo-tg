import { parse, type User } from '@telegram-apps/init-data-node';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { getToken } from '@/server/utils/getToken';
import { validateToken } from '@/server/utils/validateToken';

export type UserEnv = { Variables: { user: User; chat?: number } };

export const userMiddleware = createMiddleware<UserEnv>(async (c, next) => {
  const token = getToken(c);
  const [type, value] = token?.split(' ') ?? [];
  try {
    const user = validateToken(type, value);

    if (!user) {
      throw new HTTPException(401);
    }
    c.set('user', user);
    c.set('chat', parse(value).chat?.id);

    await next();
  } catch {
    throw new HTTPException(401);
  }
});
