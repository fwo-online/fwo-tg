import * as v from 'valibot';
import { EffectType } from '@/actions';
import { minMaxSchema } from './minMaxSchema';

export const elementAttributesSchema = v.object({
  [EffectType.Physical]: v.optional(v.number(), 0),
  [EffectType.Fire]: v.optional(v.number(), 0),
  [EffectType.Frost]: v.optional(v.number(), 0),
  [EffectType.Lightning]: v.optional(v.number(), 0),
  [EffectType.Acid]: v.optional(v.number(), 0),
  [EffectType.Clear]: v.optional(v.number(), 0),
});

export type ElementAttributes = v.InferOutput<typeof elementAttributesSchema>;

export const elementDamageSchema = v.object({
  [EffectType.Physical]: v.optional(minMaxSchema, { min: 0, max: 0 }),
  [EffectType.Fire]: v.optional(minMaxSchema, { min: 0, max: 0 }),
  [EffectType.Frost]: v.optional(minMaxSchema, { min: 0, max: 0 }),
  [EffectType.Lightning]: v.optional(minMaxSchema, { min: 0, max: 0 }),
  [EffectType.Acid]: v.optional(minMaxSchema, { min: 0, max: 0 }),
  [EffectType.Clear]: v.optional(minMaxSchema, { min: 0, max: 0 }),
});

export type ElementDamage = v.InferOutput<typeof elementDamageSchema>;
