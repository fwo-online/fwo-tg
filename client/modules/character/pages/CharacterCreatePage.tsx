import type { CreateCharacterDto } from '@fwo/shared';
import { Navigate } from 'react-router';
import { createCharacter } from '@/api/character';
import { SelectCharacter } from '@/modules/character/components/CharacterSelect';
import { useCharacterContext } from '@/contexts/character';
import { useWebSocket } from '@/contexts/webSocket';
import { useRequest } from '@/hooks/useRequest';

export const CharacterCreatePage = () => {
  const { character, setCharacter } = useCharacterContext();
  const ws = useWebSocket();
  const [_, makeRequest] = useRequest();

  const onSelect = async (createCharacterDto: CreateCharacterDto) => {
    await makeRequest(async () => {
      const character = await createCharacter(createCharacterDto);
      if (character) {
        setCharacter(character);
        ws.connect();
      }
    });
  };

  if (character) {
    return <Navigate to="/character" />;
  }

  return <SelectCharacter onSelect={onSelect} />;
};
