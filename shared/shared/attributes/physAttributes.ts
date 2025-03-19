import * as v from 'valibot';

export const physAttributesSchema = v.object({
  attack: v.optional(v.number(), 0),
  defence: v.optional(v.number(), 0),
});

export type PhysAttributes = v.InferOutput<typeof physAttributesSchema>;
