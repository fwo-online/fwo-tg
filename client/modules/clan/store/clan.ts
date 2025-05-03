import { create } from 'zustand';
import type { Clan } from '@fwo/shared';

export interface ClanState {
  clan: Clan | undefined;
  loading: boolean;
  setClan: (clan: Clan) => void;
  updateClan: (clanSource: Promise<Clan | undefined>) => void;
}

export const useClanStore = create<ClanState>((set) => ({
  clan: undefined,
  loading: false,
  setClan: (clan) => set({ clan }),
  updateClan: async (clanSource) => {
    const loadingTimeout = setTimeout(() => {
      set({ loading: true });
    }, 250);

    try {
      const clan = await clanSource;
      if (clan) {
        set({ clan });
      }
    } finally {
      clearTimeout(loadingTimeout);
      set({ loading: false });
    }
  },
}));

export function useClan(): Clan;
export function useClan<T>(selector: (c: Clan) => T): T;
export function useClan<T>(selector?: (c: Clan) => T): T | Clan {
  return useClanStore((state) => {
    if (!state.clan) {
      throw new Error('Clan is not loaded');
    }

    if (selector) {
      return selector(state.clan);
    }

    return state.clan;
  });
}
