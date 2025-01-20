import * as v from 'valibot';

export const baseAttributesSchema = v.object({
  hp: v.optional(v.number(), 0),
  mp: v.optional(v.number(), 0),
  en: v.optional(v.number(), 0),
});

export type BaseAttributes = v.InferOutput<typeof baseAttributesSchema>;
