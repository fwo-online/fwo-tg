import { z } from 'zod';
import { itemInfoSchema } from '../item/itemInfoSchema';
import { itemAttributesSchema } from '../item/itemAttributesSchema';
import { bonusAttributesSchema } from '../shared/bonusAttributes';

export const itemSetSchema = z
  .object({
    code: z.string(),
    info: itemInfoSchema,
    items: z.string().array(),
    bonus: bonusAttributesSchema.merge(z.object({
      itemsRequired: z.number(),
    })).array().default([])
  })
  .merge(itemAttributesSchema)

export type ItemSet = z.infer<typeof itemSetSchema>;
