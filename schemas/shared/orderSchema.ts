import * as v from 'valibot';

export const orderSchema = v.object({
  target: v.string(),
  action: v.string(),
  proc: v.number(),
});

export type Order = v.InferOutput<typeof orderSchema>;
