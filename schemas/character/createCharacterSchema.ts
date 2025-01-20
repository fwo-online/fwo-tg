import * as v from 'valibot';
import { characterClassSchema } from './characterClassSchema';

export const createCharacterSchema = v.object({
  name: v.pipe(v.string(), v.minLength(3)),
  class: characterClassSchema,
});

export type CreateCharacterDto = v.InferOutput<typeof createCharacterSchema>;
