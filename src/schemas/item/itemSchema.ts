import { z } from 'zod';
import { characterClassSchema } from '../character';
import { itemAttributesSchema } from './itemAttributesSchema';
import { itemInfoSchema } from './itemInfoSchema';

export const itemSchema = z
  .object({
    code: z.string(),
    info: itemInfoSchema,
    price: z.number(),
    type: z.string().optional(),
    wear: z.string(),
    weight: z.number(),
    class: z
      .string()
      .transform((s) => s.split(', '))
      .pipe(characterClassSchema.array()),
  })
  .merge(itemAttributesSchema);

export type Item = z.infer<typeof itemSchema>;
