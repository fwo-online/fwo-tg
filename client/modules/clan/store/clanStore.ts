import { createStore } from 'zustand';
import type { Clan } from '@fwo/shared';

export interface ClanProps {
  clan: Clan;
}
export interface ClanState extends ClanProps {
  loading: boolean;
  setClan: (clan: Clan) => void;
  updateClan: (clanSource: Promise<Clan | undefined>) => void;
}

export type ClanStore = ReturnType<typeof createClanStore>;

export const createClanStore = (initProps: ClanProps) =>
  createStore<ClanState>((set) => ({
    clan: initProps.clan,
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
