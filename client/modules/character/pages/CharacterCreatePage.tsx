import type { CreateCharacterDto } from '@fwo/shared';
import { Navigate } from 'react-router';
import { createCharacter } from '@/api/character';
import { SelectCharacter } from '@/modules/character/components/CharacterSelect';

import { useRequest } from '@/hooks/useRequest';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { useCharacterStore } from '@/modules/character/store/character';
import { useSocketStore } from '@/stores/socket';

export const CharacterCreatePage = () => {
  const hasCharacter = useCharacterStore((state) => Boolean(state.character));
  const connect = useSocketStore((state) => state.connect);
  const [_, makeRequest] = useRequest();
  const { syncCharacter } = useSyncCharacter();

  const onSelect = async (createCharacterDto: CreateCharacterDto) => {
    await makeRequest(async () => {
      const character = await createCharacter(createCharacterDto);
      if (character) {
        await connect();
        syncCharacter(character);
      }
    });
  };

  if (hasCharacter) {
    return <Navigate to="/character" />;
  }

  return <SelectCharacter onSelect={onSelect} />;
};
