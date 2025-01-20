import { characterClassSchema } from '@/character/characterClassSchema';
import { itemInfoSchema } from '@/item/itemInfoSchema';
import * as v from 'valibot';

export const playerSchema = v.object({
  id: v.string(),
  name: v.string(),
  class: characterClassSchema,
  lvl: v.number(),
  clan: v.any(),
  alive: v.boolean(),
  weapon: v.optional(itemInfoSchema),
});

export const publicPlayerSchema = playerSchema;

export type Player = v.InferOutput<typeof playerSchema>;
export type PublicPlayer = v.InferOutput<typeof publicPlayerSchema>;
