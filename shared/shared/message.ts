import type { Character } from '@/character';
import type { CharacterPublic } from '@/character/characterPublic';
import type { ClanPublic } from '@/clan';
import type { GameStatus, GameType } from '@/game';
import type { Action } from './action';
import type { Order } from './orderSchema';
import type { Player } from './player';
import type { RPC } from './rpc';

export type OrderResponse = RPC<{
  actions: Action[];
  magics: Action[];
  skills: Action[];
  power: number;
  orders: Order[];
}>;

export type ClientToServerMessage = Message<{
  character: [callback: (character: Character) => void];
  'lobby:enter': [callback: (characters: Record<GameType, CharacterPublic[]>) => void];
  'lobby:leave': [];
  'lobby:start': [type: GameType, callback: (payload: RPC<{ success?: boolean }>) => void];
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
  'game:order:repeat': [callback: (payload: OrderResponse) => void];
  'game:order:reset': [callback: (payload: OrderResponse) => void];
  'game:order:remove': [id: string, callback: (payload: OrderResponse) => void];
  'game:order:ready': [ready: boolean, callback: (payload: RPC<{ ready: boolean }>) => void];
  'tower:connected': [
    callback: (
      payload: RPC<{
        players: Record<string, CharacterPublic>;
        timeSpent: number;
        timeLeft: number;
      }>,
    ) => void,
  ];
}>;

type Message<T extends Record<string, unknown[]>> = {
  [K in keyof T]: (...args: T[K]) => void;
};

export type ServerToClientMessage = Message<{
  character: [character: Character];
  'lobby:enter': [character: CharacterPublic];
  'lobby:leave': [character: CharacterPublic];
  'lobby:list': [characters: Record<GameType, CharacterPublic[]>];
  'lobby:start': [character: CharacterPublic, type: GameType];
  'lobby:stop': [character: CharacterPublic, type: GameType];
  'lobby:help': [];
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
      ready: boolean;
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
  'game:players': [
    {
      players: Record<string, Player>;
      clans: Record<string, ClanPublic>;
    },
  ];
  'tower:start': [towerID: string];
  'tower:end': [];
  'tower:updateTime': [timeSpent: number, timeLeft: number];
}>;
