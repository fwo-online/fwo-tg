import type { CreateCharacterDto } from '@fwo/shared';
import { Navigate } from 'react-router';
import { createCharacter } from '@/api/character';
import { useRequest } from '@/hooks/useRequest';
import { SelectCharacter } from '@/modules/character/components/CharacterSelect';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { useCharacterStore } from '@/modules/character/store/character';

export const CharacterCreatePage = () => {
  const hasCharacter = useCharacterStore((state) => Boolean(state.character));
  const [_, makeRequest] = useRequest();
  const { syncCharacter } = useSyncCharacter();

  const onSelect = async (createCharacterDto: CreateCharacterDto) => {
    await makeRequest(async () => {
      const character = await createCharacter(createCharacterDto);
      if (character) {
        syncCharacter(character);
      }
    });
  };

  if (hasCharacter) {
    return <Navigate to="/character" />;
  }

  return <SelectCharacter onSelect={onSelect} />;
};
