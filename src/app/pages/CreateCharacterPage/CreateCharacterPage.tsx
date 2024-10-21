import type { CreateCharacterDto } from '@/schemas/character';
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { createCharacter } from '@/app/client/character';
import { SelectCharacter } from '@/app/components/SelectCharacter/SelectCharacter';
import { CharacterContext } from '@/app/contexts/character';

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
