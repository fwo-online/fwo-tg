import type { CharacterPublic } from '@/character/characterPublic';
import type { Character } from '@/character';
import type { PublicPlayer } from './playerSchema';
import type { GameStatus, PublicGameStatus } from '@/game';

export type ClientToServerMessage = Message<{
  character: [callback: (character: Character) => void];
  'lobby:enter': [];
  'lobby:leave': [];
  'matchMaking:start': [];
  'matchMaking:stop': [];
}>;

type Message<T extends Record<string, unknown[]>> = {
  [K in keyof T]: (...args: T[K]) => void;
};

export type ServerToClientMessage = Message<{
  character: [character: Character];
  'lobby:enter': [character: CharacterPublic];
  'lobby:leave': [character: CharacterPublic];
  'matchMaking:start': [character: CharacterPublic];
  'matchMaking:stop': [character: CharacterPublic];
  'game:start': [gameID: string];
  'game:end': [{ reason?: string; statisitic: unknown }];
  'game:startOrders': [];
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
