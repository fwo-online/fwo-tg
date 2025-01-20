import * as v from 'valibot';

export const inventorySchema = v.object({
  code: v.string(),
  putOn: v.boolean(),
  wear: v.string(),
});

export type Inventory = v.InferOutput<typeof inventorySchema>;
