import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import * as v from 'valibot';
import MagicService from '@/arena/MagicService';
import { characterMiddleware, userMiddleware } from '@/server/middlewares';
import { handleValidationError } from '@/server/utils/handleValidationError';
import { withValidation } from '@/server/utils/withValidation';
import { normalizeToArray } from '@/utils/array';

export const magic = new Hono()
  .use(userMiddleware, characterMiddleware)
  .post(
    '/learn/:name',
    vValidator('param', v.object({ name: v.string() }), handleValidationError),
    async (c) => {
      const character = c.get('character');
      const { name } = c.req.valid('param');

      const magic = await withValidation(MagicService.learnSpecificMagic(character, name));
      return c.json(magic);
    },
  )
  .get(
    '/',
    vValidator(
      'query',
      v.object({ ids: v.optional(v.union([v.string(), v.array(v.string())])) }),
      handleValidationError,
    ),
    async (c) => {
      const { ids } = c.req.valid('query');
      const character = c.get('character');
      const targetIds = normalizeToArray(ids);

      if (!targetIds.length) {
        const magics = MagicService.getMagicListByProf(character.prof);
        return c.json(magics);
      } else {
        const magics = MagicService.getMagicListByIds(targetIds, character.prof);
        return c.json(magics);
      }
    },
  )
  .get('/:id', (c) => {
    const character = c.get('character');
    const id = c.req.param('id');
    const magic = MagicService.getMagicById(id, character.prof);

    return c.json(magic);
  });
