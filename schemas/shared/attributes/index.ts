import { z } from 'zod';
import { characterAttributesSchema } from '@/character/characterAttributesSchema';
import { minMaxSchema } from './minMaxSchema';
import { magicAttributesSchema } from './magicAttrututes';
import { physAttributesSchema } from './physAttributes';
import { baseAttributesSchema } from './baseAttributes';
import { elementAttributesSchema } from './elementAttributes';

export const attributesSchema = z.object({
  attributes: characterAttributesSchema.default({
    str: 0,
    dex: 0,
    con: 0,
    int: 0,
    wis: 0,
  }),
  magic: magicAttributesSchema.default({ attack: 0, defence: 0 }),
  phys: physAttributesSchema.default({ attack: 0, defence: 0 }),
  base: baseAttributesSchema.default({ hp: 0, mp: 0, en: 0 }),
  regen: baseAttributesSchema.default({ hp: 0, mp: 0, en: 0 }),
  heal: minMaxSchema.default({ min: 0, max: 0 }),
  hit: minMaxSchema.default({ min: 0, max: 0 }),
  resists: elementAttributesSchema.default({ fire: 0, frost: 0, acid: 0, lightning: 0 }),
});

export type Attributes = z.infer<typeof attributesSchema>;

export * from './baseAttributes';
export * from './elementAttributes';
export * from './magicAttrututes';
export * from './minMaxSchema';
export * from './physAttributes';
