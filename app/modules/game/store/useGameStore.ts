import type { Action, GameStatus, PublicGameStatus } from '@fwo/schemas';
import { create } from 'zustand';

export type GameStoreState = {
  round: number;
  orders: {
    target: string;
    action: string;
    power: number;
  }[];
  canOrder: boolean;
  status: GameStatus[];
  statusByClan: Record<string, PublicGameStatus[]>;
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
  setStatusByClan: (statusByClan: Record<string, PublicGameStatus[]>) => void;
  setActions: (action: { actions: Action[]; magics: Action[]; skills: Action[] }) => void;
};

export type GameStore = GameStoreState & GameStoreActions;

export const useGameStore = create<GameStore>()((set) => ({
  round: 0,
  canOrder: false,
  actions: [],
  magics: [],
  skills: [],
  power: 0,
  orders: [],
  status: [],
  statusByClan: {},
  setRound: (round) => set({ round }),
  setCanOrder: (canOrder) => set({ canOrder }),
  setPower: (power) => set({ power }),
  setOrders: (orders) => set({ orders }),
  setStatus: (status) => set({ status }),
  setStatusByClan: (statusByClan) => set({ statusByClan }),
  setActions: (actions) => set(actions),
}));
