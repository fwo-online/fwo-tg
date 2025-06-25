import { characterAttributesSchema, createCharacterSchema } from '@fwo/shared';
import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import * as v from 'valibot';
import { createCharacter } from '@/api/character';
import { CharacterService } from '@/arena/CharacterService';
import { profsData } from '@/data/profs';
import { handleValidationError } from '@/server/utils/handleValidationError';
import { withValidation } from '@/server/utils/withValidation';
import { normalizeToArray } from '@/utils/array';
import { characterMiddleware, userMiddleware } from './middlewares';

export const character = new Hono()
  .use(userMiddleware)
  .post('/', vValidator('json', createCharacterSchema, handleValidationError), async (c) => {
    const createCharacterDto = await c.req.valid('json');
    const user = c.get('user');
    const { id } = await withValidation(
      createCharacter({
        owner: user.id.toString(),
        nickname: createCharacterDto.name,
        prof: createCharacterDto.class,
        harks: profsData[createCharacterDto.class].hark,
        magics: profsData[createCharacterDto.class].mag,
        sex: 'm',
      }),
    );

    const character = await CharacterService.getCharacterById(id);
    return c.json(character.toObject(), 200);
  })
  .use(characterMiddleware)
  .get('/', async (c) => {
    const character = c.get('character');

    return c.json(character.toObject(), 200);
  })
  .delete('/', async (c) => {
    const character = c.get('character');
    await withValidation(character.remove());

    return c.json({}, 200);
  })
  .patch('/attributes', vValidator('json', characterAttributesSchema), async (c) => {
    const character = c.get('character');
    const attributes = c.req.valid('json');

    await withValidation(character.attributes.increaseAttributes(attributes));

    return c.json(character.toObject(), 200);
  })
  .get('/dynamic-attributes', vValidator('query', characterAttributesSchema), async (c) => {
    const character = c.get('character');
    const attributes = c.req.valid('query');
    const dynamicAttributes = character.attributes.getDynamicAttributes(attributes);

    return c.json(dynamicAttributes, 200);
  })
  .get(
    '/list',
    vValidator('query', v.object({ ids: v.union([v.array(v.string()), v.string()]) })),
    async (c) => {
      const { ids } = c.req.valid('query');

      const characters = await withValidation(
        Promise.all(
          normalizeToArray(ids).map(async (id) => {
            const character = await CharacterService.getCharacterById(id);
            return character.toPublicObject();
          }),
        ),
      );

      return c.json(characters, 200);
    },
  );
