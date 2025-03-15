import type { CharacterPublic } from '@/character/characterPublic';
import type { Character } from '@/character';
import type { Player } from './player';
import type { GameStatus } from '@/game';
import type { Action } from './action';
import type { RPC } from './rpc';

export type ClientToServerMessage = Message<{
  character: [callback: (character: Character) => void];
  'lobby:enter': [callback: (characters: CharacterPublic[]) => void];
  'lobby:leave': [];
  'lobby:start': [];
  'lobby:stop': [];
  'game:connected': [callback: (payload: RPC<{ players: Record<string, Player> }>) => void];
  'game:order': [
    order: {
      power: number;
      action: string;
      target: string;
    },
    callback: (
      payload: RPC<{
        actions: Action[];
        magics: Action[];
        skills: Action[];
        power: number;
        orders: {
          power: number;
          action: string;
          target: string;
        }[];
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
  'lobby:list': [characters: CharacterPublic[]];
  'lobby:start': [character: CharacterPublic];
  'lobby:stop': [character: CharacterPublic];
  'game:start': [gameID: string];
  'game:end': [];
  'game:startOrders': [actions: { actions: Action[]; magics: Action[]; skills: Action[] }];
  'game:endOrders': [];
  'game:startRound': [
    {
      round: number;
      status: Partial<Record<string, GameStatus[]>>;
    },
  ];
  'game:endRound': [{ dead: Player[] }];
  'game:kick': [{ reason: string; player: Player }];
  'game:preKick': [{ reason: string; player: Player }];
}>;
