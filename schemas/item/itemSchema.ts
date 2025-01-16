import { z } from 'zod';
import { characterAttributesSchema, characterClassSchema } from '@/character';
import { itemInfoSchema } from '@/item/itemInfoSchema';
import { attributesSchema } from '@/shared/attributes';

export const itemSchema = z
  .object({
    code: z.string(),
    info: itemInfoSchema,
    price: z.number(),
    type: z.string().optional(),
    wear: z.string(),
    weight: z.number(),
    class: characterClassSchema.array(),
    requiredAttributes: characterAttributesSchema.default({
      str: 0,
      dex: 0,
      con: 0,
      int: 0,
      wis: 0,
    }),
  })
  .merge(attributesSchema);

export type Item = z.infer<typeof itemSchema>;
