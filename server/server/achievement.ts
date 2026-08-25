import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import * as v from 'valibot';
import { AchievementService } from '@/arena/AchievementService';
import { handleValidationError } from '@/server/utils/handleValidationError';
import { withValidation } from '@/server/utils/withValidation';
import { characterMiddleware, userMiddleware } from './middlewares';

export const achievements = new Hono()
  .use(userMiddleware)
  .use(characterMiddleware)
  .get('/', async (c) => {
    const character = c.get('character');
    const list = AchievementService.getAchievements(character);
    return c.json(list, 200);
  })
  .post(
    '/claim',
    vValidator(
      'json',
      v.object({ id: v.string() }),
      handleValidationError,
    ),
    async (c) => {
      const character = c.get('character');
      const { id } = c.req.valid('json');

      const reward = await withValidation(AchievementService.claim(character, id));

      return c.json({ reward, character: character.toObject() }, 200);
    },
  )
  .post(
    '/set-title',
    vValidator(
      'json',
      v.object({ title: v.nullable(v.string()) }),
      handleValidationError,
    ),
    async (c) => {
      const character = c.get('character');
      const { title } = c.req.valid('json');

      await withValidation(AchievementService.setActiveTitle(character, title));

      return c.json({ activeTitle: character.activeTitle, character: character.toObject() }, 200);
    },
  );
