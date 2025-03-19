import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { CharacterService } from '@/arena/CharacterService';
import type { UserEnv } from '@/server/middlewares/userMiddleware';

export type CharacterEnv = UserEnv & {
  Variables: {
    character: CharacterService;
  };
};

export const characterMiddleware = createMiddleware<CharacterEnv>(async (c, next) => {
  const user = c.get('user');

  try {
    const character = await CharacterService.getCharacter(user.id.toString());
    c.set('character', character);
  } catch {
    throw new HTTPException(401);
  }
  await next();
});
