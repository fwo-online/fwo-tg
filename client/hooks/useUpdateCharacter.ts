import { getCharacter } from '@/api/character';
import { useCharacter } from '@/contexts/character';

export const useUpdateCharacter = () => {
  const { setCharacter } = useCharacter();

  const updateCharacter = async () => {
    await getCharacter().then(setCharacter);
  };

  return {
    updateCharacter,
  };
};
