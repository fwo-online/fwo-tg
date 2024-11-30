import { use, useContext } from 'react';
import { CharacterContext } from '@/contexts/character';

export const useCharacter = () => {
  const { character } = use(CharacterContext);

  return {
    character,
  };
};
