import { idSchema } from '@/shared';
import { object, string, boolean, type InferOutput } from 'valibot';

export const inventorySchema = object({
  ...idSchema.entries,
  code: string(),
  putOn: boolean(),
  wear: string(),
});

export type Inventory = InferOutput<typeof inventorySchema>;
