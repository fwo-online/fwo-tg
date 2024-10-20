import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import MagicService from '@/arena/MagicService';
import { characterMiddleware } from './middlewares/characterMiddleware';

export const magic = new Hono()
  .use(characterMiddleware)
  .patch('/:lvl', zValidator('param', z.object({ lvl: z.number() })), async (c) => {
    const character = c.get('character');
    const { lvl } = c.req.valid('param');

    const magic = await MagicService.learnMagic(character, lvl);
    return c.json({ name: magic.name });
  });
