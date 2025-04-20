import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import { characterMiddleware, userMiddleware } from '@/server/middlewares';
import * as v from 'valibot';
import { ItemService } from '@/arena/ItemService/ItemService';

export const shop = new Hono()
  .use(userMiddleware, characterMiddleware)
  .get(
    '',
    vValidator('query', v.optional(v.object({ wear: v.string(), tier: v.number() }))),
    async (c) => {
      const character = c.get('character');
      const query = c.req.valid('query');
      const items = ItemService.getItemsByClass(character.class, query);

      return c.json(items, 200);
    },
  );
