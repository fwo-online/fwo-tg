import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import { idSchema } from '@fwo/shared';
import { characterMiddleware, userMiddleware } from '@/server/middlewares';
import { withValidation } from '@/server/utils/withValidation';
import { CraftService } from '@/arena/CraftService/CraftService';

export const inventory = new Hono()
  .use(userMiddleware, characterMiddleware)
  .patch('/:id/equip', vValidator('param', idSchema), async (c) => {
    const character = c.get('character');
    const { id } = c.req.valid('param');

    await withValidation(character.inventory.equipItem(id));

    return c.json({}, 200);
  })
  .patch('/:id/unequip', vValidator('param', idSchema), async (c) => {
    const character = c.get('character');
    const { id } = c.req.valid('param');

    await withValidation(character.inventory.unEquipItem(id));

    return c.json({}, 200);
  })
  .post('/forge/:code', async (c) => {
    const character = c.get('character');
    const code = c.req.param('code');

    const item = await withValidation(CraftService.craftItem(character, code, 1));

    return c.json(item, 200);
  });
