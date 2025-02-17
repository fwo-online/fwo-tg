import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import { characterMiddleware, userMiddleware } from '@/server/middlewares';
import * as v from 'valibot';
import { ClanService } from '@/arena/ClanService';
import { idSchema } from '@fwo/schemas';
import { withValidation } from './utils/withValidation';

export const shop = new Hono()
  .use(userMiddleware, characterMiddleware)
  .get('/', async (c) => {
    const clans = await ClanService.getClanList();

    return c.json(clans, 200);
  })
  .get('/:id', vValidator('param', idSchema), async (c) => {
    const { id } = c.req.valid('param');

    const clan = await ClanService.getClanById(id);

    return c.json(clan, 200);
  })
  .get('/:id', vValidator('param', idSchema), async (c) => {
    const { id } = c.req.valid('param');

    const clan = await ClanService.getClanById(id);

    return c.json(clan, 200);
  })
  .post('/', vValidator('json', v.object({ name: v.string() })), async (c) => {
    const character = c.get('character');
    const { name } = c.req.valid('json');

    const clan = await withValidation(ClanService.createClan(character.id, name));

    return c.json(clan, 200);
  })
  .post('/accept/:id', vValidator('param', idSchema), async (c) => {
    const character = c.get('character');
    const { id } = c.req.valid('param');

    await withValidation(ClanService.acceptRequest(character.clan?.id, id));

    return c.json({}, 200);
  })
  .post('/reject/:id', vValidator('param', idSchema), async (c) => {
    const character = c.get('character');
    const { id } = c.req.valid('param');

    await withValidation(ClanService.rejectRequest(character.clan?.id, id));

    return c.json({}, 200);
  })
  .post('/:id/request', vValidator('param', idSchema), async (c) => {
    const character = c.get('character');
    const { id } = c.req.valid('param');

    // @TODO: разделить создание и отмену заявки
    await withValidation(ClanService.handleRequest(id, character.id));

    return c.json({}, 200);
  });
