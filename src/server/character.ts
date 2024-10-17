import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { createCharacter } from '@/api/character';
import { profsData } from '@/data/profs';
import { characterAttributesSchema, createCharacterSchema } from '@/schemas/character';
import { characterMiddleware } from './middlewares/characterMiddleware';
import { userMiddleware } from './middlewares/userMiddleware';

export const character = new Hono()
  .get('/foo', (c) => {
    return c.notFound();
  })
  .use(userMiddleware)
  .post('/', zValidator('json', createCharacterSchema), async (c) => {
    const createCharacterDto = await c.req.valid('json');
    const user = c.get('user');
    const character = await createCharacter({
      tgId: user?.id,
      nickname: createCharacterDto.name,
      prof: createCharacterDto.class,
      harks: profsData[createCharacterDto.class].hark,
      magics: profsData[createCharacterDto.class].mag,
      sex: 'm',
    });

    return c.json(character);
  })
  .use(characterMiddleware)
  .get('/', async (c) => {
    return c.json(c.get('character'));
  })
  .patch('/attributes', zValidator('json', characterAttributesSchema), async (c) => {
    const character = c.get('character');
    const harks = c.req.valid('json');
    // fixme
    await character.submitIncreaseHarks({ ...harks, free: 0 });
    await character.saveToDb();
  });
