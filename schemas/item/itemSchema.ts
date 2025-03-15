import * as v from 'valibot';
import { characterAttributesSchema, characterClassSchema } from '@/character';
import { itemInfoSchema } from '@/item/itemInfoSchema';
import { attributesSchema } from '@/shared/attributes';

export const itemSchema = v.object({
  code: v.string(),
  info: itemInfoSchema,
  price: v.number(),
  type: v.optional(v.string()),
  wear: v.string(),
  weight: v.optional(v.number()),
  class: v.array(characterClassSchema),
  requiredAttributes: v.optional(characterAttributesSchema, {
    str: 0,
    dex: 0,
    con: 0,
    int: 0,
    wis: 0,
  }),
  ...attributesSchema.entries,
});

export type ItemInput = v.InferInput<typeof itemSchema>;
export type Item = v.InferOutput<typeof itemSchema>;
