import * as v from 'valibot';

export const magicAttributesSchema = v.object({
  attack: v.optional(v.number(), 0),
  defence: v.optional(v.number(), 0),
});

export type MagicAttributes = v.InferOutput<typeof magicAttributesSchema>;
