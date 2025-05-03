import { addClanGold } from '@/api/clan';
import { useRequest } from '@/hooks/useRequest';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { useSyncClan } from '@/modules/clan/hooks/useSyncClan';

export const useClanGold = () => {
  const { syncCharacter } = useSyncCharacter();
  const { syncClan } = useSyncClan();
  const [_, makeRequest] = useRequest();

  const addGold = async (gold: number) => {
    syncClan(await makeRequest(() => addClanGold(gold)));
    await syncCharacter();
  };

  return {
    addGold,
  };
};
