import * as v from 'valibot';

export const magicSchema = v.object({
  name: v.string(),
  desc: v.string(),
  displayName: v.string(),
  cost: v.number(),
  effect: v.array(v.string()),
  lvl: v.number(),
});

export type Magic = v.InferOutput<typeof magicSchema>;
