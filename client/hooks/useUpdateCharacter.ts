import { useCharacter } from '@/contexts/character';
import { useCallback } from 'react';

export const useUpdateCharacter = () => {
  const { setCharacter } = useCharacter();

  const updateCharacter = useCallback(async () => {
    await setCharacter();
  }, [setCharacter]);

  return {
    updateCharacter,
  };
};
