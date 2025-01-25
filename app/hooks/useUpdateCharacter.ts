import { getCharacter } from '@/client/character';
import { useCharacter } from './useCharacter';

export const useUpdateCharacter = () => {
  const { setCharacter } = useCharacter();

  const updateCharacter = async () => {
    await getCharacter().then(setCharacter);
  };

  return {
    updateCharacter,
  };
};
