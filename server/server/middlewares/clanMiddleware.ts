import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import type { CharacterService } from '@/arena/CharacterService';
import type { UserEnv } from '@/server/middlewares/userMiddleware';
import type { Clan } from '@/models/clan';

export type CharacterEnv = UserEnv & {
  Variables: {
    character: CharacterService & { clan: Clan };
  };
};

export const clanMiddleware = ({ owner = false }: { owner?: boolean } = {}) =>
  createMiddleware<CharacterEnv>(async (c, next) => {
    const character = c.get('character');

    if (!character.clan) {
      throw new HTTPException(400, { message: 'Вы не состоите в клане' });
    }

    if (owner && !character.clan.owner._id.equals(character.id)) {
      throw new HTTPException(400, { message: 'Вы не являетесь владельцем клана' });
    }

    await next();
  });
