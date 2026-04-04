import * as v from 'valibot';

export enum QuestType {
  Kills = 'kills',
  Damage = 'damage',
  Heal = 'heal',
}

export const questSchema = v.object({
  type: v.enum(QuestType),
  goal: v.number(),
  progress: v.optional(v.number(), 0),
});

export type Quest = v.InferOutput<typeof questSchema>;
