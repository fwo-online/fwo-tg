import type { Action, ClanPublic, GameStatus, Order, Player } from '@fwo/shared';
import { create } from 'zustand';

export type GameStoreState = {
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
  setClans: (clans: Record<string, ClanPublic>) => void;
  setOrdersTime: (ordersTime: number, ordersStartTime: number) => void;
  reset: () => void;
};

export type GameStore = GameStoreState & GameStoreActions;

const initialState: GameStoreState = {
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
  setClans: (clans) => set({ clans }),
  setOrdersTime: (ordersTime, ordersStartTime) => set({ ordersTime, ordersStartTime }),
  reset: () => set(initialState),
}));
