import { z } from 'zod';

export const characterAttributesSchema = z.object({
  str: z.number({ coerce: true }).int().default(0),
  dex: z.number({ coerce: true }).int().default(0),
  int: z.number({ coerce: true }).int().default(0),
  wis: z.number({ coerce: true }).int().default(0),
  con: z.number({ coerce: true }).int().default(0),
});

export type CharacterAttributes = z.infer<typeof characterAttributesSchema>;
