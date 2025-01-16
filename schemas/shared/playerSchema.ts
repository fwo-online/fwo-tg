import { characterClassSchema } from '@/character/characterClassSchema';
import { itemInfoSchema } from '@/item/itemInfoSchema';
import { z } from 'zod';

export const playerSchema = z.object({
  id: z.string(),
  name: z.string(),
  class: characterClassSchema,
  lvl: z.number(),
  clan: z.any(),
  alive: z.boolean(),
  weapon: itemInfoSchema.optional(),
});

export const publicPlayerSchema = playerSchema.pick({
  id: true,
  name: true,
  class: true,
  lvl: true,
  clan: true,
  alive: true,
  weapon: true,
});

export type Player = z.infer<typeof playerSchema>;
export type PublicPlayer = z.infer<typeof publicPlayerSchema>;
