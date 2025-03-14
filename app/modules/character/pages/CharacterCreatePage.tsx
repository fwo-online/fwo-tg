import type { CreateCharacterDto } from '@fwo/schemas';
import { Navigate } from 'react-router';
import { createCharacter } from '@/client/character';
import { SelectCharacter } from '@/modules/character/components/CharacterSelect';
import { useCharacterContext } from '@/contexts/character';
import { useWebSocket } from '@/contexts/webSocket';

export const CharacterCreatePage = () => {
  const { character, setCharacter } = useCharacterContext();
  const ws = useWebSocket();

  const onSelect = async (createCharacterDto: CreateCharacterDto) => {
    const character = await createCharacter(createCharacterDto);
    if (character) {
      setCharacter(character);
      ws.connect();
    }
  };

  if (character) {
    return <Navigate to="/character" />;
  }

  return <SelectCharacter onSelect={onSelect} />;
};
