import { itemInfoSchema } from '@/item/itemInfoSchema';
import { attributesSchema } from '@/shared/attributes';
import { modifiersSchema } from '@/shared/modifiers';
import { z } from 'zod';

export const itemSetSchema = z
  .object({
    code: z.string(),
    info: itemInfoSchema,
    items: z.string().array(),
    modifiers: modifiersSchema
      .merge(
        z.object({
          itemsRequired: z.number(),
        }),
      )
      .array(),
  })
  .merge(attributesSchema);

export type ItemSet = z.infer<typeof itemSetSchema>;
