import type { CreateCharacterDto } from '@fwo/schemas';
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { createCharacter } from '@/client/character';
import { SelectCharacter } from '@/components/SelectCharacter/SelectCharacter';
import { CharacterContext } from '@/contexts/character';

export const CreateCharacterPage = () => {
  const { character, setCharacter } = useContext(CharacterContext);

  const onSelect = async (createCharacterDto: CreateCharacterDto) => {
    const character = await createCharacter(createCharacterDto);
    if (character) {
      setCharacter(character);
    }
  };

  if (character) {
    return <Navigate to="/character" />;
  }

  return (
    <SelectCharacter onSelect={onSelect} />
  );
};
