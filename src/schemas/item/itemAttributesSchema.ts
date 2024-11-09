import { z } from 'zod';
import { characterAttributesSchema } from '@/schemas/character';
import { minMaxSchema } from '@/schemas/shared/minMaxSchema';
import { magicAttributesSchema } from '@/schemas/shared/magicAttrututes';
import { physAttributesSchema } from '@/schemas/shared/physAttributes';
import { baseAttributesSchema } from '@/schemas/shared/baseAttributes';

const defaultCharacterAttributes = {
  str: 0,
  dex: 0,
  con: 0,
  int: 0,
  wis: 0,
};

export const itemAttributesSchema = z.object({
  requiredAttributes: characterAttributesSchema.default(defaultCharacterAttributes),
  attributes: characterAttributesSchema.default(defaultCharacterAttributes),
  magic: magicAttributesSchema.default({ attack: 0, defence: 0 }),
  phys: physAttributesSchema.default({ attack: 0, defence: 0 }),
  base: baseAttributesSchema.default({ hp: 0, mp: 0, en: 0 }),
  regen: baseAttributesSchema.default({ hp: 0, mp: 0, en: 0 }),
  heal: minMaxSchema.default({ min: 0, max: 0 }),
  hit: minMaxSchema.default({ min: 0, max: 0 }),
});

export type ItemAttributes = z.infer<typeof itemAttributesSchema>;
