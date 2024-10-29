import { z } from "zod";
import { characterAttributesSchema, characterClassSchema } from "../character";
import { stringToJSONSchema } from "../shared/stringToJSONSchema";
import { minMaxSchema } from "../shared/minMaxSchema";

export const itemSchema = z.object({
  code: z.string(),
  name: z.string(),
  physAtk: z.number({ coerce: true }).optional(),
  physDef: z.number({ coerce: true }).optional(),
  magicAtk: z.number({ coerce: true }).optional(),
  magicDef: z.number({ coerce: true }).optional(),
  price: z.number({ coerce: true }),
  wear: z.string().optional(),
  type: z.string().optional(),
  class: z.string().transform(s => s.split(', ')).pipe(characterClassSchema.array()),
  weight: z.number({ coerce: true }),
  set: z.string().optional().transform(s => s?.split(',')),
  hl: z.number({ coerce: true }).optional(),
  addAttr: stringToJSONSchema.pipe(characterAttributesSchema.partial().optional()),
  addHp: z.number({ coerce: true }).optional(),
  addMp: z.number({ coerce: true }).optional(),
  addEn: z.number({ coerce: true }).optional(),
  hit: stringToJSONSchema.pipe(minMaxSchema.optional()),
})

export type Item = z.infer<typeof itemSchema>;