import type { CreateCharacterDto } from '@fwo/schemas';
import { use, useContext } from 'react';
import { Navigate } from 'react-router';
import { createCharacter } from '@/client/character';
import { SelectCharacter } from '@/components/SelectCharacter/SelectCharacter';
import { CharacterContext } from '@/contexts/character';

export const CreateCharacterPage = () => {
  const { character, setCharacter } = use(CharacterContext);

  const onSelect = async (createCharacterDto: CreateCharacterDto) => {
    const character = await createCharacter(createCharacterDto);
    if (character) {
      setCharacter(character);
    }
  };

  if (character) {
    return <Navigate to="/character" />;
  }

  return <SelectCharacter onSelect={onSelect} />;
};
