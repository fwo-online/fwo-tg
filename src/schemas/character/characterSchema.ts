import { z } from 'zod';
import { characterAttributesSchema } from './characterAttributesSchema';
import { characterClassSchema } from './characterClassSchema';

export const characterSchema = z.object({
  name: z.string().min(3),
  owner: z.string(),
  gold: z.number().positive().int(),
  bonus: z.number().positive().int(),
  lvl: z.number().positive().int(),
  class: characterClassSchema,
  attributes: characterAttributesSchema,
});

export type Character = z.infer<typeof characterSchema>
