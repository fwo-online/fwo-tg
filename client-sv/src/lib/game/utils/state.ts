import type { Action, ClanPublic, GameStatus, Order, Player } from '@fwo/shared';

export type GameState = {
  round: number;
  orders: Order[];
  players: Record<string, Player>;
  clans: Record<string, ClanPublic>;
  canOrder: boolean;
  status: GameStatus[];
  statusByClan: Partial<Record<string, GameStatus[]>>;
  power: number;
  actions: Action[];
  magics: Action[];
  skills: Action[];
  ordersTime: number;
  ordersStartTime: number;
  ready: boolean;
};

export const createGameState = (): GameState => ({
  round: 0,
  players: {},
  clans: {},
  canOrder: false,
  actions: [],
  magics: [],
  skills: [],
  power: 0,
  orders: [],
  status: [],
  statusByClan: {},
  ordersTime: 0,
  ordersStartTime: 0,
  ready: false,
});
