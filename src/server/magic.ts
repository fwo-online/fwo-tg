import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import * as v from 'valibot';
import MagicService from '@/arena/MagicService';
import { characterMiddleware, userMiddleware } from '@/server/middlewares';
import { normalizeToArray } from '@/utils/array';

export const magic = new Hono()
  .use(userMiddleware, characterMiddleware)
  .post(
    '/:lvl',
    vValidator('param', v.object({ lvl: v.pipe(v.string(), v.decimal(), v.transform(Number)) })),
    async (c) => {
      const character = c.get('character');
      const { lvl } = c.req.valid('param');

      const magic = await MagicService.learnMagic(character, lvl);
      return c.json({ name: magic.name });
    },
  )
  .get(
    '/',
    vValidator('query', v.object({ ids: v.union([v.string(), v.array(v.string())]) })),
    async (c) => {
      const { ids } = c.req.valid('query');
      const magics = MagicService.getMagicListByIds(normalizeToArray(ids));

      return c.json(magics);
    },
  )
  .get('/available', (c) => {
    const character = c.get('character');
    const magics = MagicService.getMagicListByProf(character.prof);

    return c.json(magics);
  })
  .get('/:id', (c) => {
    const id = c.req.param('id');
    const magic = MagicService.getMagicById(id);

    return c.json(magic);
  });
