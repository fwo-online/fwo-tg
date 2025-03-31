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
      set({ loading: true });
      const clan = await clanSource;
      if (clan) {
        set({ clan });
      }
      set({ loading: false });
    },
  }));
