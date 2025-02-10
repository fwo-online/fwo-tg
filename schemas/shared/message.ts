import type { CharacterPublic } from '@/character/characterPublic';
import type { Character } from '@/character';
import type { PublicPlayer } from './playerSchema';
import type { GameStatus, PublicGameStatus } from '@/game';
import type { Action } from './action';

export type ClientToServerMessage = Message<{
  character: [callback: (character: Character) => void];
  'lobby:enter': [callback: (characters: CharacterPublic[]) => void];
  'lobby:leave': [];
  'lobby:start': [];
  'lobby:stop': [];
  'game:order': [
    order: {
      power: number;
      action: string;
      target: string;
    },
    callback: (
      payload:
        | {
            success: true;
            actions: Action[];
            magics: Action[];
            skills: Action[];
            power: number;
            orders: {
              power: number;
              action: string;
              target: string;
            }[];
          }
        | { success: false; message: string },
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
  'game:end': [{ reason?: string; statisitic: unknown }];
  'game:startOrders': [actions: { actions: Action[]; magics: Action[]; skills: Action[] }];
  'game:endOrders': [];
  'game:startRound': [
    {
      round: number;
      status: GameStatus[];
      statusByClan: Record<string, PublicGameStatus[]>;
    },
  ];
  'game:endRound': [
    {
      dead: PublicPlayer[];
      log: unknown[];
    },
  ];
  'game:kick': [
    {
      reason: string;
      player: PublicPlayer;
    },
  ];
  'game:preKick': [{ reason: string }];
}>;
