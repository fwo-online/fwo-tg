import type { Action, GameStatus, Order, Player } from '@fwo/shared';
import { create } from 'zustand';

export type GameStoreState = {
  round: number;
  orders: Order[];
  players: Record<string, Player>;
  canOrder: boolean;
  status: GameStatus[];
  statusByClan: Partial<Record<string, GameStatus[]>>;
  power: number;
  actions: Action[];
  magics: Action[];
  skills: Action[];
};

export type GameStoreActions = {
  setRound: (round: number) => void;
  setCanOrder: (canOrder: boolean) => void;
  setPower: (power: number) => void;
  setOrders: (orders: GameStoreState['orders']) => void;
  setStatus: (status: GameStatus[]) => void;
  setStatusByClan: (statusByClan: Partial<Record<string, GameStatus[]>>) => void;
  setActions: (action: { actions: Action[]; magics: Action[]; skills: Action[] }) => void;
  setPlayers: (players: Record<string, Player>) => void;
  reset: () => void;
};

export type GameStore = GameStoreState & GameStoreActions;

const initialState: GameStoreState = {
  round: 0,
  players: {},
  canOrder: false,
  actions: [],
  magics: [],
  skills: [],
  power: 0,
  orders: [],
  status: [],
  statusByClan: {},
};

export const useGameStore = create<GameStore>()((set) => ({
  ...initialState,
  setRound: (round) => set({ round }),
  setCanOrder: (canOrder) => set({ canOrder }),
  setPower: (power) => set({ power }),
  setOrders: (orders) => set({ orders }),
  setStatus: (status) => set({ status }),
  setStatusByClan: (statusByClan) => set({ statusByClan }),
  setActions: (actions) => set(actions),
  setPlayers: (players) => set({ players }),
  reset: () => set(initialState),
}));
