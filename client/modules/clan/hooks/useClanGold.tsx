import { addClanGold } from '@/api/clan';
import { useRequest } from '@/hooks/useRequest';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';
import { useClanStore } from '@/modules/clan/contexts/useClan';

export const useClanGold = () => {
  const { updateCharacter } = useUpdateCharacter();
  const updateClan = useClanStore((state) => state.updateClan);
  const [_, makeRequest] = useRequest();

  const addGold = async (gold: number) => {
    await updateClan(makeRequest(() => addClanGold(gold)));
    updateCharacter();
  };

  return {
    addGold,
  };
};
