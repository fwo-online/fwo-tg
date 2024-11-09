import { z } from 'zod';
import { characterAttributesSchema } from './characterAttributesSchema';
import { characterClassSchema } from './characterClassSchema';
import { inventorySchema } from '@/schemas/inventory';

export const characterSchema = z.object({
  name: z.string().min(3),
  owner: z.string(),
  gold: z.number().positive().int(),
  bonus: z.number().positive().int(),
  lvl: z.number().positive().int(),
  class: characterClassSchema,
  attributes: characterAttributesSchema,
  inventory: z.array(inventorySchema),
  magics: z.record(z.number()),
  skills: z.record(z.number()),
  clan: z.any(),
});

export type Character = z.infer<typeof characterSchema>;
