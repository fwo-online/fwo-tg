import type { CreateCharacterDto } from '@fwo/schemas';
import { Navigate } from 'react-router';
import { createCharacter } from '@/client/character';
import { SelectCharacter } from '@/modules/character/components/CharacterSelect';
import { useCharacterContext } from '@/contexts/character';

export const CharacterCreatePage = () => {
  const { character, setCharacter } = useCharacterContext();

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
