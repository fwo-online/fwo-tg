import * as v from 'valibot';

export const elementAttributesSchema = v.object({
  fire: v.optional(v.number(), 0),
  frost: v.optional(v.number(), 0),
  acid: v.optional(v.number(), 0),
  lightning: v.optional(v.number(), 0),
});

export type ElementAttributes = v.InferOutput<typeof elementAttributesSchema>;
