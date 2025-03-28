import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import { createCharacter } from '@/api/character';
import { CharacterService } from '@/arena/CharacterService';
import { profsData } from '@/data/profs';
import { characterAttributesSchema, createCharacterSchema } from '@fwo/shared';
import { characterMiddleware, userMiddleware } from './middlewares';
import { withValidation } from '@/server/utils/withValidation';
import { flatten } from 'valibot';
import { HTTPException } from 'hono/http-exception';

export const character = new Hono()
  .use(userMiddleware)
  .post(
    '/',
    vValidator('json', createCharacterSchema, (result) => {
      if (!result.success) {
        const message = Object.values(flatten(result.issues).nested ?? {})
          .flat()
          .join(', ');

        throw new HTTPException(400, { message });
      }
    }),
    async (c) => {
      const createCharacterDto = await c.req.valid('json');
      const user = c.get('user');
      await withValidation(
        createCharacter({
          owner: user.id.toString(),
          nickname: createCharacterDto.name,
          prof: createCharacterDto.class,
          harks: profsData[createCharacterDto.class].hark,
          magics: profsData[createCharacterDto.class].mag,
          sex: 'm',
        }),
      );

      const character = await CharacterService.getCharacter(user.id.toString());
      return c.json(character.toObject(), 200);
    },
  )
  .use(characterMiddleware)
  .get('/', async (c) => {
    const character = c.get('character');

    return c.json(character.toObject(), 200);
  })
  .delete('/', async (c) => {
    const character = c.get('character');
    await character.remove();

    return c.json({}, 200);
  })
  .patch('/attributes', vValidator('json', characterAttributesSchema), async (c) => {
    const character = c.get('character');
    const attributes = c.req.valid('json');

    await character.increaseHarks(attributes);

    return c.json(character.toObject(), 200);
  })
  .get('/dynamic-attributes', vValidator('query', characterAttributesSchema), async (c) => {
    const character = c.get('character');
    const attributes = c.req.valid('query');
    const dynamicAttributes = character.getDynamicAttributes(attributes);

    return c.json(dynamicAttributes, 200);
  });
