import type { Clan } from '@fwo/shared';
import { getClan } from '@/api/clan';
import { useClanStore } from '@/modules/clan/store/clan';

export const useSyncClan = () => {
  const setClan = useClanStore((state) => state.setClan);

  const syncClan = async (newClan?: Clan) => {
    if (newClan) {
      return setClan(newClan);
    }

    const clan = await getClan();
    setClan(clan);
  };

  return {
    syncClan,
  };
};
