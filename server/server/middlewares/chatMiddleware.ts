import { createMiddleware } from 'hono/factory';
import type { CharacterEnv } from '@/server/middlewares';

export const chatMiddleware = createMiddleware<CharacterEnv>(async (c, next) => {
  const character = c.get('character');
  const chat = c.get('chat');

  if (character.chat || !chat) {
    return;
  }

  try {
    await character.setChat(chat);
  } catch {
    // throw new HTTPException(401);
  }
  await next();
});
