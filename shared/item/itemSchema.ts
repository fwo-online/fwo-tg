import * as v from 'valibot';
import { characterAttributesSchema, characterClassSchema } from '@/character';
import { itemInfoSchema } from '@/item/itemInfoSchema';
import { attributesSchema } from '@/shared/attributes';
import { questSchema } from '@/shared/quest';
import { ItemComponent } from './itemComponent';
import { ItemWear } from './itemWear';

export const itemSchema = v.object({
  code: v.string(),
  info: itemInfoSchema,
  price: v.number(),
  type: v.optional(v.string()),
  wear: v.enum(ItemWear),
  weight: v.optional(v.number()),
  class: v.array(characterClassSchema),
  requiredAttributes: v.optional(characterAttributesSchema, {
    str: 0,
    dex: 0,
    con: 0,
    int: 0,
    wis: 0,
  }),
  ...attributesSchema.entries,
  craft: v.optional(
    v.object({
      components: v.record(v.enum(ItemComponent), v.number()),
    }),
  ),
  modifiers: v.optional(v.record(v.string(), v.partial(attributesSchema))),
  tier: v.number(),
  hidden: v.optional(v.boolean(), false),
  passive: v.optional(
    v.object({
      name: v.string(),
      level: v.number(),
      unlocked: v.optional(v.boolean(), false),
      quest: v.optional(questSchema),
    }),
  ),
});

export type ItemInput = v.InferInput<typeof itemSchema>;
export type ItemOutput = v.InferOutput<typeof itemSchema>;

export type Item = ItemOutput;
export type ItemWithID = ItemOutput & { id: string };
