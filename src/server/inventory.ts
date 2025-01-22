import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import { idSchema } from '@fwo/schemas';
import { characterMiddleware, userMiddleware } from '@/server/middlewares';
import { withValidation } from './utils/withValidation';

export const inventory = new Hono()
  .use(userMiddleware, characterMiddleware)
  .patch('/equip/:id', vValidator('param', idSchema), async (c) => {
    const character = c.get('character');
    const { id } = c.req.valid('param');

    await withValidation(() => character.inventory.equipItem(id));

    return c.json({}, 200);
  })
  .patch('/unequip/:id', vValidator('param', idSchema), async (c) => {
    const character = c.get('character');
    const { id } = c.req.valid('param');

    await character.inventory.unEquipItem(id);
    return c.json({}, 200);
  })
  .post('/buy/:id', vValidator('param', idSchema), async (c) => {
    const character = c.get('character');
    const { id } = c.req.valid('param');

    await character.buyItem(id);
    return c.json({}, 200);
  })
  .delete('/sell/:id', vValidator('param', idSchema), async (c) => {
    const character = c.get('character');
    const { id } = c.req.valid('param');

    await character.sellItem(id);
    return c.json({}, 200);
  });
