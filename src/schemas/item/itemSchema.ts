import { z } from 'zod';
import { characterAttributesSchema, characterClassSchema } from '@/schemas/character';
import { itemAttributesSchema } from '@/schemas/item/itemAttributesSchema';
import { itemInfoSchema } from '@/schemas/item/itemInfoSchema';

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
  .merge(itemAttributesSchema);

export type Item = z.infer<typeof itemSchema>;
