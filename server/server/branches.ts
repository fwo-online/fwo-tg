import { BRANCHES, keys } from '@fwo/shared';
import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import * as v from 'valibot';
import AbilityTreeService from '@/arena/AbilityTreeService';
import BranchService from '@/arena/BranchService';
import { characterMiddleware, userMiddleware } from '@/server/middlewares';
import { handleValidationError } from '@/server/utils/handleValidationError';
import { withValidation } from '@/server/utils/withValidation';

export const branches = new Hono()
  .use(userMiddleware, characterMiddleware)
  .get('/tree', (c) => c.json(AbilityTreeService.getTree(c.get('character'))))
  .get('/', (c) => c.json(BranchService.getBranchesInfo(c.get('character'))))
  .post(
    '/',
    vValidator('json', v.object({ branch: v.picklist(keys(BRANCHES)) }), handleValidationError),
    async (c) => {
      const { branch } = c.req.valid('json');
      const character = c.get('character');

      const result = await withValidation(BranchService.selectBranch(character, branch));

      return c.json(result);
    },
  );
