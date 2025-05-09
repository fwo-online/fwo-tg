import type { CharacterPublic } from '@/character/characterPublic';
import type { Character } from '@/character';
import type { Player } from './player';
import type { GameStatus } from '@/game';
import type { Action } from './action';
import type { RPC } from './rpc';
import type { Order } from './orderSchema';
import type { ClanPublic } from '@/clan';

export type OrderResponse = RPC<{
  actions: Action[];
  magics: Action[];
  skills: Action[];
  power: number;
  orders: Order[];
}>;

export type ClientToServerMessage = Message<{
  character: [callback: (character: Character) => void];
  'lobby:enter': [callback: (characters: CharacterPublic[]) => void];
  'lobby:leave': [];
  'lobby:start': [callback: (payload: RPC<{ success?: boolean }>) => void];
  'lobby:stop': [];
  'game:connected': [
    callback: (
      payload: RPC<{
        players: Record<string, Player>;
        clans: Record<string, ClanPublic>;
      }>,
    ) => void,
  ];
  'game:order': [
    order: {
      power: number;
      action: string;
      target: string;
    },
    callback: (payload: OrderResponse) => void,
  ];
  'game:orderRepeat': [callback: (payload: OrderResponse) => void];
  'game:orderReset': [callback: (payload: OrderResponse) => void];
}>;

type Message<T extends Record<string, unknown[]>> = {
  [K in keyof T]: (...args: T[K]) => void;
};

export type ServerToClientMessage = Message<{
  character: [character: Character];
  'lobby:enter': [character: CharacterPublic];
  'lobby:leave': [character: CharacterPublic];
  'lobby:list': [characters: CharacterPublic[]];
  'lobby:start': [character: CharacterPublic];
  'lobby:stop': [character: CharacterPublic];
  'game:start': [gameID: string];
  'game:end': [];
  'game:startOrders': [
    data: {
      actions: Action[];
      magics: Action[];
      skills: Action[];
      power: number;
      orders: Order[];
      ordersTime: number;
      ordersStartTime: number;
    },
  ];
  'game:endOrders': [];
  'game:startRound': [
    {
      round: number;
      status: Partial<Record<string, GameStatus[]>>;
    },
  ];
  'game:kick': [{ reason: string; player: Player }];
  'game:preKick': [{ reason: string; player: Player }];
}>;
