import { z } from 'zod';
import { characterClassSchema } from '../character';
import { itemAttributesSchema } from './itemAttributesSchema';

export const itemSchema = z
  .object({
    code: z.string(),
    name: z.string(),
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
