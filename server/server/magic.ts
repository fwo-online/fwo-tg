import type { MagicBranchId } from '@fwo/shared';
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
  .get('/branches', (c) => {
    const character = c.get('character');
    const branchesInfo = MagicService.getBranchesInfo(character);
    return c.json(branchesInfo);
  })
  .post(
    '/branch',
    vValidator('json', v.object({ branch: v.string() }), handleValidationError),
    async (c) => {
      const character = c.get('character');
      const { branch } = c.req.valid('json');

      const result = await withValidation(
        MagicService.selectBranch(character, branch as MagicBranchId),
      );
      return c.json(result);
    },
  )
  // .post('/reset', async (c) => {
  //   const character = c.get('character');
  //   const result = await withValidation(MagicService.resetMagics(character));
  //   return c.json(result);
  // })
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
    '/branch/:branchId',
    vValidator('param', v.object({ branchId: v.string() }), handleValidationError),
    (c) => {
      const character = c.get('character');
      const { branchId } = c.req.valid('param');
      const magics = MagicService.getBranchMagics(character, branchId as MagicBranchId);

      return c.json(magics);
    },
  )
  .get('/available', (c) => {
    const character = c.get('character');
    const magicLevels = MagicService.getAvaiableLevels(character);

    return c.json(magicLevels);
  })
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
  .post(
    '/:lvl',
    vValidator(
      'param',
      v.object({ lvl: v.pipe(v.string(), v.decimal(), v.transform(Number)) }),
      handleValidationError,
    ),
    async (c) => {
      const character = c.get('character');
      const { lvl } = c.req.valid('param');

      const magic = await withValidation(MagicService.learnMagic(character, lvl));
      return c.json(magic);
    },
  )
  .get('/:id', (c) => {
    const character = c.get('character');
    const id = c.req.param('id');
    const magic = MagicService.getMagicById(id, character.prof);

    return c.json(magic);
  });
