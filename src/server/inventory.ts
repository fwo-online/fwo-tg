import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import { idSchema } from '@fwo/schemas';
import { characterMiddleware, userMiddleware } from '@/server/middlewares';

export const inventory = new Hono()
  .use(userMiddleware, characterMiddleware)
  .patch('/equip/:id', vValidator('param', idSchema), async (c) => {
    const character = c.get('character');
    const { id } = c.req.valid('param');

    await character.inventory.equipItem(id);
  })
  .patch('/unequip/:id', vValidator('param', idSchema), async (c) => {
    const character = c.get('character');
    const { id } = c.req.valid('param');

    await character.inventory.unEquipItem(id);
  })
  .delete('/sell/:id', vValidator('param', idSchema), async (c) => {
    const character = c.get('character');
    const { id } = c.req.valid('param');

    // todo validate if unequipped
    await character.sellItem(id);
  });
