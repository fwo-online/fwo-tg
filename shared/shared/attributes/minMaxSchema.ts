import * as v from 'valibot';

export const minMaxSchema = v.pipe(
  v.object({
    min: v.optional(v.number(), 0),
    max: v.optional(v.number(), 0),
  }),
  v.check(({ min, max }) => max >= min),
);

export type MinMax = v.InferOutput<typeof minMaxSchema>;
