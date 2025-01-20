import { characterPublicSchema } from '@/character/characterPublic';
import { gameMessageSchema } from '@/game/gameMessages';
import * as v from 'valibot';
import { orderSchema } from './orderSchema';

export const clientToServerMessageSchema = v.variant('type', [
  v.variant('action', [
    v.object({ type: v.literal('lobby'), action: v.literal('enter') }),
    v.object({ type: v.literal('lobby'), action: v.literal('leave') }),
  ]),
  v.variant('action', [
    v.object({
      type: v.literal('match_making'),
      action: v.literal('start_search'),
    }),
    v.object({
      type: v.literal('match_making'),
      action: v.literal('stop_search'),
    }),
  ]),
  v.variant('action', [
    v.object({
      type: v.literal('game'),
      action: v.literal('order'),
      order: orderSchema,
    }),
  ]),
]);

export type ClientToServerMessage = v.InferOutput<typeof clientToServerMessageSchema>;

export const serverToClientMessageSchema = v.variant('type', [
  v.variant('action', [
    v.object({
      type: v.literal('lobby'),
      action: v.literal('enter'),
      data: characterPublicSchema,
    }),
    v.object({
      type: v.literal('lobby'),
      action: v.literal('leave'),
      data: characterPublicSchema,
    }),
  ]),
  v.variant('action', [
    v.object({
      type: v.literal('match_making'),
      action: v.literal('start_search'),
      data: characterPublicSchema,
    }),
    v.object({
      type: v.literal('match_making'),
      action: v.literal('stop_search'),
      data: characterPublicSchema,
    }),
  ]),
  v.variant('action', [gameMessageSchema]),
]);

export type ServerToClientMessage = v.InferOutput<typeof serverToClientMessageSchema>;
