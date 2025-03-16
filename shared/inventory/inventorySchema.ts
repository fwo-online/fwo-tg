import { object, string, boolean, type InferOutput } from 'valibot';
import { idSchema } from '@/shared/id';
import { itemSchema } from '@/item';

export const inventorySchema = object({
  ...idSchema.entries,
  code: string(),
  putOn: boolean(),
  wear: string(),
  item: itemSchema,
});

export type Inventory = InferOutput<typeof inventorySchema>;
