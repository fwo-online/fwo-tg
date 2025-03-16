import { Hono } from 'hono';
import SkillService from '@/arena/SkillService';
import { characterMiddleware, userMiddleware } from '@/server/middlewares';
import * as v from 'valibot';
import { vValidator } from '@hono/valibot-validator';
import { withValidation } from './utils/withValidation';

export const skill = new Hono()
  .use(userMiddleware, characterMiddleware)
  .get(
    '/',
    vValidator('query', v.object({ ids: v.union([v.array(v.string()), v.string()]) })),
    async (c) => {
      const { ids } = c.req.valid('query');
      console.log(ids);
      const skills = SkillService.getSkillList(Array.isArray(ids) ? ids : [ids]);

      return c.json(skills);
    },
  )
  .get('/available', (c) => {
    const character = c.get('character');
    const skills = SkillService.getSkillListByProf(character.prof);

    return c.json(skills);
  })
  .get('/:id', async (c) => {
    const { id } = c.req.param();

    const skill = await SkillService.getSkillById(id);

    return c.json(skill);
  })
  .post('/:id', async (c) => {
    const character = c.get('character');
    const { id } = c.req.param();

    await withValidation(SkillService.learnSkill(character, id));

    return c.json({}, 200);
  });
