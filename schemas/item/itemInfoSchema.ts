import * as v from 'valibot';

export const itemInfoSchema = v.object({
  name: v.string(),
  description: v.optional(v.string()),
  case: v.optional(v.string()),
});

export type ItemInfo = v.InferOutput<typeof itemInfoSchema>;
