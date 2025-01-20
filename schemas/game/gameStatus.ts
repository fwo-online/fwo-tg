import * as v from 'valibot';

export const gameStatus = v.object({
  name: v.string(),
  hp: v.number(),
  mp: v.number(),
  en: v.number(),
});

export const publicGameStatus = v.pick(gameStatus, ['name', 'hp']);

export type GameStatus = v.InferOutput<typeof gameStatus>;
export type PublicGameStatus = v.InferOutput<typeof publicGameStatus>;
