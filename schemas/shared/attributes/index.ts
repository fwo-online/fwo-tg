import * as v from 'valibot';
import { characterAttributesSchema } from '@/character/characterAttributesSchema';
import { minMaxSchema } from './minMaxSchema';
import { magicAttributesSchema } from './magicAttrututes';
import { physAttributesSchema } from './physAttributes';
import { baseAttributesSchema } from './baseAttributes';
import { elementAttributesSchema } from './elementAttributes';

export const attributesSchema = v.object({
  attributes: v.optional(characterAttributesSchema, {
    str: 0,
    dex: 0,
    con: 0,
    int: 0,
    wis: 0,
  }),
  magic: v.optional(magicAttributesSchema, { attack: 0, defence: 0 }),
  phys: v.optional(physAttributesSchema, { attack: 0, defence: 0 }),
  base: v.optional(baseAttributesSchema, { hp: 0, mp: 0, en: 0 }),
  regen: v.optional(baseAttributesSchema, { hp: 0, mp: 0, en: 0 }),
  heal: v.optional(minMaxSchema, { min: 0, max: 0 }),
  hit: v.optional(minMaxSchema, { min: 0, max: 0 }),
  resists: v.optional(elementAttributesSchema, { fire: 0, frost: 0, acid: 0, lightning: 0 }),
});

export type AttributesInput = v.InferInput<typeof attributesSchema>;
export type Attributes = v.InferOutput<typeof attributesSchema>;

export * from './baseAttributes';
export * from './elementAttributes';
export * from './magicAttrututes';
export * from './minMaxSchema';
export * from './physAttributes';
