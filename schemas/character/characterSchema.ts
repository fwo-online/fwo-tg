import { z } from 'zod';
import { inventorySchema } from '@/inventory/inventorySchema';
import { characterAttributesSchema } from './characterAttributesSchema';
import { characterClassSchema } from './characterClassSchema';
import { attributesSchema } from '@/shared/attributes';

export const characterSchema = z.object({
  name: z.string().min(3),
  owner: z.string(),
  gold: z.number().positive().int(),
  free: z.number().positive().int(),
  bonus: z.number().positive().int(),
  lvl: z.number().positive().int(),
  exp: z.number().int(),
  class: characterClassSchema,
  attributes: characterAttributesSchema,
  inventory: z.array(inventorySchema),
  magics: z.record(z.number()),
  skills: z.record(z.number()),
  clan: z.any(),
  dynamicAttributes: attributesSchema,
});

export type Character = z.infer<typeof characterSchema>;
