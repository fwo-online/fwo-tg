import type { ForestEventType, Reward } from '@fwo/shared';
import { create } from 'zustand';

interface ForestState {
  reward: Reward;
  event: ForestEventType | undefined;
  setReward: (reward: Reward) => void;
  setEvent: (event: ForestEventType) => void;
  resetEvent: () => void;
}

export const useForestStore = create<ForestState>((set) => ({
  reward: { components: {}, exp: 0, gold: 0 },
  event: undefined,
  setReward: (reward) => set({ reward }),
  setEvent: (event) => set({ event }),
  resetEvent: () => set({ event: undefined }),
}));
