import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import { characterMiddleware, userMiddleware } from '@/server/middlewares';
import { ClanService } from '@/arena/ClanService';
import { createClanSchema, idSchema } from '@fwo/shared';
import { withValidation } from './utils/withValidation';
import { handleValidationError } from '@/server/utils/handleValidationError';
import { clanMiddleware } from '@/server/middlewares/clanMiddleware';
import * as v from 'valibot';

export const clan = new Hono()
  .use(userMiddleware, characterMiddleware)
  .get('/', async (c) => {
    const clans = await ClanService.getClanList();

    return c.json(clans.map(ClanService.toObject), 200);
  })
  .post('/', vValidator('json', createClanSchema, handleValidationError), async (c) => {
    const character = c.get('character');
    const { name } = c.req.valid('json');

    const clan = await withValidation(ClanService.createClan(character.id, name));

    return c.json(clan, 200);
  })
  .post('/:id/create-request', vValidator('param', idSchema), async (c) => {
    const character = c.get('character');
    const { id } = c.req.valid('param');

    await withValidation(ClanService.createRequest(id, character.id));

    return c.json({}, 200);
  })
  .post('/:id/cancel-request', vValidator('param', idSchema), async (c) => {
    const character = c.get('character');
    const { id } = c.req.valid('param');

    await withValidation(ClanService.removeRequest(id, character.id));

    return c.json({}, 200);
  })
  .use(clanMiddleware())
  .get('/:id', vValidator('param', idSchema), async (c) => {
    const { id } = c.req.valid('param');

    const clan = await withValidation(ClanService.getClanById(id));

    return c.json(ClanService.toObject(clan), 200);
  })
  .post('/add-gold', vValidator('json', v.object({ gold: v.number() })), async (c) => {
    const character = c.get('character');
    const { gold } = c.req.valid('json');

    await withValidation(ClanService.addGold(character.clan.id, character.id, gold));

    return c.json({}, 200);
  })
  .post('/leave', async (c) => {
    const character = c.get('character');

    await withValidation(ClanService.leaveClan(character.clan.id, character.id));

    return c.json({}, 200);
  })
  .use(clanMiddleware({ owner: true }))
  .delete('', async (c) => {
    const character = c.get('character');

    await withValidation(ClanService.removeClan(character.clan.id, character.id));

    return c.json({}, 200);
  })
  .post('/accept/:id', vValidator('param', idSchema), async (c) => {
    const character = c.get('character');
    const { id } = c.req.valid('param');

    await withValidation(ClanService.acceptRequest(character.clan.id, id));

    return c.json({}, 200);
  })
  .post('/reject/:id', vValidator('param', idSchema), async (c) => {
    const character = c.get('character');
    const { id } = c.req.valid('param');

    await withValidation(ClanService.rejectRequest(character.clan.id, id));

    return c.json({}, 200);
  })
  .post('/upgrade-lvl', async (c) => {
    const character = c.get('character');

    await withValidation(ClanService.levelUp(character.clan.id));

    return c.json({}, 200);
  });
