import { Hono } from 'hono';
import * as v from 'valibot';
import PassiveSkillService from '@/arena/PassiveSkillService';
import { characterMiddleware, userMiddleware } from '@/server/middlewares';
import { vValidator } from '@/server/utils/validatorWrapper';
import { normalizeToArray } from '@/utils/array';
import { withValidation } from './utils/withValidation';

export const passiveSkill = new Hono()
  .use(userMiddleware, characterMiddleware)
  .get(
    '/',
    vValidator('query', v.object({ ids: v.optional(v.union([v.array(v.string()), v.string()])) })),
    async (c) => {
      const { ids } = c.req.valid('query');
      const passiveSkills = PassiveSkillService.getPassiveSkillList(
        ids ? normalizeToArray(ids) : undefined,
      );

      return c.json(passiveSkills);
    },
  )
  .get('/:id', async (c) => {
    const { id } = c.req.param();

    const passiveSkill = await PassiveSkillService.getPassiveSkillById(id);

    return c.json(passiveSkill);
  })
  .post('/:id', async (c) => {
    const character = c.get('character');
    const { id } = c.req.param();

    await withValidation(PassiveSkillService.learnPassiveSkill(character, id));

    return c.json({}, 200);
  });
