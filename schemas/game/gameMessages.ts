import { publicPlayerSchema } from '@/shared';
import * as v from 'valibot';
import { gameStatus, publicGameStatus } from './gameStatus';

export const gameMessageSchema = v.variant('action', [
  v.object({
    type: v.literal('game'),
    action: v.literal('start'),
    gameID: v.string(),
  }),
  v.object({
    type: v.literal('game'),
    action: v.literal('end'),
    reason: v.optional(v.string()),
    statistic: v.any(),
  }),
  v.object({
    type: v.literal('game'),
    action: v.literal('startOrders'),
  }),
  v.object({
    type: v.literal('game'),
    action: v.literal('endOrders'),
  }),
  v.object({
    type: v.literal('game'),
    action: v.literal('startRound'),
    round: v.number(),
    status: v.array(gameStatus),
    statusByClan: v.record(v.string(), v.array(publicGameStatus)),
  }),
  v.object({
    type: v.literal('game'),
    action: v.literal('endRound'),
    dead: v.array(publicPlayerSchema),
    log: v.array(v.any()),
  }),
  v.object({
    type: v.literal('game'),
    action: v.literal('kick'),
    reason: v.string(),
    player: publicPlayerSchema,
  }),
  v.object({
    type: v.literal('game'),
    action: v.literal('preKick'),
    reason: v.string(),
  }),
]);

export type GameMessage = v.InferOutput<typeof gameMessageSchema>;
