import { type ClanState, type ClanStore, createClanStore } from '@/modules/clan/store/clanStore';
import type { Clan } from '@fwo/shared';
import type { PropsWithChildren } from 'react';
import { createContext, use, useRef } from 'react';
import { useStore } from 'zustand';

export const ClanContext = createContext<ClanStore | undefined>(undefined);

export const ClanProvider = ({ children, clan }: PropsWithChildren<{ clan: Clan }>) => {
  const storeRef = useRef<ClanStore>(undefined);

  if (!storeRef.current) {
    storeRef.current = createClanStore({ clan });
  }

  return <ClanContext value={storeRef.current}>{children}</ClanContext>;
};

export function useClanStore<T>(selector: (state: ClanState) => T): T {
  const store = use(ClanContext);

  if (!store) {
    throw new Error('clan must be within ChanContext');
  }

  return useStore(store, selector);
}
