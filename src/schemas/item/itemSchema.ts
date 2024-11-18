import { z } from 'zod';
import { characterClassSchema } from '../character';
import { itemAttributesSchema } from './itemAttributesSchema';
import { itemInfoSchema } from './itemInfoSchema';
import { bonusAttributesSchema } from '../shared/bonusAttributes';

export const itemSchema = z
  .object({
    code: z.string(),
    info: itemInfoSchema,
    price: z.number(),
    type: z.string().optional(),
    wear: z.string(),
    weight: z.number(),
    class: characterClassSchema.array(),
    bonus: bonusAttributesSchema.array().default([]),
  })
  .merge(itemAttributesSchema);

export type Item = z.infer<typeof itemSchema>;
