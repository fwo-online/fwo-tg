import { itemInfoSchema } from '@/item/itemInfoSchema';
import { attributesSchema } from '@/shared/attributes';
import { modifiersSchema } from '@/shared/modifiers';
import * as v from 'valibot';

export const itemSetSchema = v.object({
  code: v.string(),
  info: itemInfoSchema,
  items: v.array(v.string()),
  modifiers: v.array(
    v.object({
      itemsRequired: v.number(),
      ...modifiersSchema.entries,
    }),
  ),
  ...attributesSchema.entries,
});

export type ItemSetInput = v.InferInput<typeof itemSetSchema>;
export type ItemSet = v.InferOutput<typeof itemSetSchema>;
