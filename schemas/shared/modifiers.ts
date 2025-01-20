import * as v from 'valibot';

export const modifiersSchema = v.object({
  type: v.string(),
  chance: v.optional(v.number(), 0),
  effect: v.optional(v.number(), 0),
});

export type Modifiers = v.InferOutput<typeof modifiersSchema>;
