import { getCharacter } from '@/api/character';
import { useCharacterStore } from '@/modules/character/store/character';
import type { Character } from '@fwo/shared';
import useSWR from 'swr';

export const useSyncCharacter = () => {
  const setCharacter = useCharacterStore((state) => state.setCharacter);

  const { isLoading, mutate, error } = useSWR('character', getCharacter, {
    onSuccess: (character) => {
      if (character) {
        setCharacter(character);
      }
    },
    revalidateOnMount: false,
    suspense: true,
  });

  const syncCharacter = async (newCharacter?: Character | null) => {
    if (newCharacter) {
      setCharacter(newCharacter);
      return mutate(newCharacter, { revalidate: false });
    }

    return mutate();
  };

  const clearCharacter = async () => {
    setCharacter(undefined);
    await mutate(undefined, { revalidate: false });
  };

  return {
    clearCharacter,
    syncCharacter,
    isLoading,
    error,
  };
};
