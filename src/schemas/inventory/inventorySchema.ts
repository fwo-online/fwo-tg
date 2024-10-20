import { z } from 'zod';

export const inventorySchema = z.object({
  code: z.string(),
  equipped: z.boolean(),
  wear: z.string(),
});

export type Inventory = z.infer<typeof inventorySchema>
