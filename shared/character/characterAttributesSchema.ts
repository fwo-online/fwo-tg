import * as v from 'valibot';

export const characterAttributesSchema = v.object({
  str: v.optional(v.pipe(v.any(), v.transform(Number), v.number()), 0),
  dex: v.optional(v.pipe(v.any(), v.transform(Number), v.number()), 0),
  int: v.optional(v.pipe(v.any(), v.transform(Number), v.number()), 0),
  wis: v.optional(v.pipe(v.any(), v.transform(Number), v.number()), 0),
  con: v.optional(v.pipe(v.any(), v.transform(Number), v.number()), 0),
});

export type CharacterAttributesInput = v.InferInput<typeof characterAttributesSchema>;
export type CharacterAttributes = v.InferOutput<typeof characterAttributesSchema>;
