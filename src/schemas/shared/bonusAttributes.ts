import { z } from 'zod';

export const bonusAttributesSchema = z.object({
  type: z.string(),
  chance: z.number().default(0),
  effect: z.number().default(0),
});

export type BonusAttributes = z.infer<typeof bonusAttributesSchema>;
