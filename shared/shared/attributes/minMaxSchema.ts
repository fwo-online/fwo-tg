import * as v from 'valibot';

export const minMaxSchema = v.object({
  min: v.optional(v.number(), 0),
  max: v.optional(v.number(), 0),
});

export type MinMax = v.InferOutput<typeof minMaxSchema>;
