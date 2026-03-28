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
  ap: number;
  maxAP: number;
  actions: Action[];
  magics: Action[];
  skills: Action[];
  ordersTime: number;
  ordersStartTime: number;
  ready: boolean;
};

export type GameStoreActions = {
  setRound: (round: number) => void;
  setCanOrder: (canOrder: boolean) => void;
  setActionPoints: (ap: number, maxAP: number) => void;
  setOrders: (orders: GameStoreState['orders']) => void;
  setStatus: (status: GameStatus[]) => void;
  setStatusByClan: (statusByClan: Partial<Record<string, GameStatus[]>>) => void;
  setActions: (action: { actions: Action[]; magics: Action[]; skills: Action[] }) => void;
  setPlayers: (players: Record<string, Player>) => void;
  setClans: (clans: Record<string, ClanPublic>) => void;
  setOrdersTime: (ordersTime: number, ordersStartTime: number) => void;
  setReady: (ready: boolean) => void;
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
  ap: 0,
  maxAP: 0,
  orders: [],
  status: [],
  statusByClan: {},
  ordersTime: 0,
  ordersStartTime: 0,
  ready: false,
};

export const useGameStore = create<GameStore>()((set) => ({
  ...initialState,
  setRound: (round) => set({ round }),
  setCanOrder: (canOrder) => set({ canOrder }),
  setActionPoints: (ap, maxAP) => set(() => ({ ap, maxAP })),
  setOrders: (orders) => set({ orders }),
  setStatus: (status) => set({ status }),
  setStatusByClan: (statusByClan) => set({ statusByClan }),
  setActions: (actions) => set(actions),
  setPlayers: (players) => set({ players }),
  setClans: (clans) => set({ clans }),
  setOrdersTime: (ordersTime, ordersStartTime) => set({ ordersTime, ordersStartTime }),
  setReady: (ready) => set({ ready }),
  reset: () => set(initialState),
}));
