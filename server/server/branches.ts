import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import * as v from 'valibot';
import BranchService from '@/arena/BranchService';
import { characterMiddleware, userMiddleware } from '@/server/middlewares';
import { handleValidationError } from '@/server/utils/handleValidationError';
import { withValidation } from '@/server/utils/withValidation';

export const branches = new Hono()
  .use(userMiddleware, characterMiddleware)
  .get('/', (c) => c.json(BranchService.getBranchesInfo(c.get('character'))))
  .post(
    '/',
    vValidator('json', v.object({ branch: v.string() }), handleValidationError),
    async (c) => {
      const result = await withValidation(
        BranchService.selectBranch(c.get('character'), c.req.valid('json').branch),
      );
      return c.json(result);
    },
  );
