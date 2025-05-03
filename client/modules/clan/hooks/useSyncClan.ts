import { getClanByID } from '@/api/clan';
import { useCharacter } from '@/modules/character/store/character';
import { useClanStore } from '@/modules/clan/store/clan';
import type { Clan } from '@fwo/shared';
import useSWR from 'swr';

export const useSyncClan = () => {
  const clanID = useCharacter((state) => state.clan?.id || '');
  const setClan = useClanStore((state) => state.setClan);

  const { isLoading, mutate } = useSWR(`clan/${clanID}}`, () => getClanByID(clanID), {
    onSuccess: (clan) => {
      if (clan) {
        setClan(clan);
      }
    },
    revalidateOnMount: true,
    suspense: true,
  });

  const syncClan = async (newClan?: Clan) => {
    if (newClan) {
      setClan(newClan);
      return mutate(newClan, false);
    }

    return mutate();
  };

  return {
    syncClan,
    isLoading,
  };
};
