import { publicPlayerSchema } from '@/shared';
import { z } from 'zod';
import { gameStatus, publicGameStatus } from './gameStatus';

export const gameMessageSchema = z.discriminatedUnion('action', [
  z.object({
    type: z.literal('game'),
    action: z.literal('start'),
    gameID: z.string(),
  }),
  z.object({
    type: z.literal('game'),
    action: z.literal('end'),
    reason: z.string().optional(),
    statistic: z.any(),
  }),
  z.object({
    type: z.literal('game'),
    action: z.literal('startOrders'),
  }),
  z.object({
    type: z.literal('game'),
    action: z.literal('endOrders'),
  }),
  z.object({
    type: z.literal('game'),
    action: z.literal('startRound'),
    round: z.number(),
    status: gameStatus.array(),
    statusByClan: z.record(publicGameStatus.array()),
  }),
  z.object({
    type: z.literal('game'),
    action: z.literal('endRound'),
    dead: publicPlayerSchema.array(),
    log: z.any().array(),
  }),
  z.object({
    type: z.literal('game'),
    action: z.literal('kick'),
    reason: z.string(),
    player: publicPlayerSchema,
  }),
  z.object({
    type: z.literal('game'),
    action: z.literal('preKick'),
    reason: z.string(),
  }),
]);

export type GameMessage = z.infer<typeof gameMessageSchema>;
