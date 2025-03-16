import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import { idSchema } from '@fwo/shared';
import { characterMiddleware, userMiddleware } from '@/server/middlewares';
import { withValidation } from '@/server/utils/withValidation';
import { object, string } from 'valibot';

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

    await character.inventory.unEquipItem(id);
    return c.json({}, 200);
  })
  .post('/:code', vValidator('param', object({ code: string() })), async (c) => {
    const character = c.get('character');
    const { code } = c.req.valid('param');

    await withValidation(character.buyItem(code));
    return c.json({}, 200);
  })
  .delete('/:id', vValidator('param', idSchema), async (c) => {
    const character = c.get('character');
    const { id } = c.req.valid('param');

    await withValidation(character.sellItem(id));
    return c.json({}, 200);
  });
