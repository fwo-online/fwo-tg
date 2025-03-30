import { addGold } from '@/api/clan';
import { useCharacter } from '@/contexts/character';
import { useRequest } from '@/hooks/useRequest';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';
import { clear } from 'suspend-react';

export const useClanGold = () => {
  const { character } = useCharacter();
  const { updateCharacter } = useUpdateCharacter();
  const [isLoading, makeRequest] = useRequest();

  const handleAddGold = (gold: number) => {
    makeRequest(async () => {
      await addGold(gold);
      await updateCharacter();
      clear([character.clan?.id]);
    });
  };

  return {
    isLoading,
    handleAddGold,
  };
};
