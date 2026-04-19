import type { Character } from '@fwo/shared';
import { getCharacter } from '@/api/character';
import { useMountEffect } from '@/hooks/useMountEffect';
import { useCharacterStore } from '@/modules/character/store/character';

export const useSyncCharacter = () => {
  const character = useCharacterStore((state) => state.character);
  const setCharacter = useCharacterStore((state) => state.setCharacter);

  const syncCharacter = async (newCharacter?: Character | null) => {
    if (newCharacter) {
      setCharacter(newCharacter);
    }

    const character = await getCharacter();
    if (character) {
      setCharacter(character);
    }
  };

  const clearCharacter = async () => {
    setCharacter(undefined);
  };

  useMountEffect(() => {
    if (!character) {
      syncCharacter();
    }
  });

  return {
    clearCharacter,
    syncCharacter,
  };
};
