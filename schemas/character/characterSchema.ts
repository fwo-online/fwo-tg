import * as v from 'valibot';
import { characterAttributesSchema } from './characterAttributesSchema';
import { characterClassSchema } from './characterClassSchema';
import { attributesSchema } from '@/shared/attributes';
import { inventorySchema } from '@/inventory/inventorySchema';

export const characterSchema = v.object({
  name: v.pipe(v.string(), v.minLength(3)),
  owner: v.string(),
  gold: v.pipe(v.number(), v.minValue(0), v.integer()),
  free: v.pipe(v.number(), v.minValue(0), v.integer()),
  bonus: v.pipe(v.number(), v.minValue(0), v.integer()),
  lvl: v.pipe(v.number(), v.minValue(0), v.integer()),
  exp: v.pipe(v.number(), v.minValue(0), v.integer()),
  class: characterClassSchema,
  attributes: characterAttributesSchema,
  inventory: v.array(inventorySchema),
  magics: v.record(v.string(), v.number()),
  skills: v.record(v.string(), v.number()),
  clan: v.any(),
  dynamicAttributes: attributesSchema,
});

export type Character = v.InferOutput<typeof characterSchema>;
