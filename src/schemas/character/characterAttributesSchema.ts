import { z } from 'zod';

export const characterAttributesSchema = z.object({
  str: z.number().positive().int(),
  dex: z.number().positive().int(),
  int: z.number().positive().int(),
  wis: z.number().positive().int(),
  con: z.number().positive().int(),
});

export type CharacterAttributes = z.infer<typeof characterAttributesSchema>
