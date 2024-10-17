import type { User } from '@telegram-apps/init-data-node';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import CharacterService from '@/arena/CharacterService';

export const characterMiddleware = createMiddleware<{
  Variables: {
    character: CharacterService,
    user: User
  }
}>(
  async (c, next) => {
    const user = c.get('user');
    if (!user) {
      throw new HTTPException(401);
    }
    const character = await CharacterService.getCharacter(user.id);
    c.set('character', character);
    await next();
  },
);
