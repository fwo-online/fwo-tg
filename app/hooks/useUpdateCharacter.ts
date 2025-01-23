import { getCharacter } from '@/client/character';
import { useCharacter } from './useCharacter';

export const useUpdateCharacter = () => {
  const { setCharacter } = useCharacter();

  const updateCharacter = async () => {
    const character = await getCharacter();
    if (character) {
      setCharacter(character);
    }
  };

  return {
    updateCharacter,
  };
};
