import * as v from 'valibot';
import { characterClassSchema } from './characterClassSchema';
import { nameSchema } from '@/shared';

export const createCharacterSchema = v.object({
  name: nameSchema,
  class: characterClassSchema,
});

export type CreateCharacterDto = v.InferOutput<typeof createCharacterSchema>;
