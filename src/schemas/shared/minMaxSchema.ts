import { z } from "zod";

export const minMaxSchema = z.object({
  min: z.number(),
  max: z.number(),
})

export type MinMax = z.infer<typeof minMaxSchema>