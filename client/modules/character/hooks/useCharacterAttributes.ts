import type { CharacterAttributes } from '@fwo/shared';
import { changeCharacterAttributes } from '@/api/character';
import { usePopup } from '@/hooks/usePopup';
import { useRequest } from '@/hooks/useRequest';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';

export const useCharacterAttributes = () => {
  const { syncCharacter } = useSyncCharacter();
  const [isPending, makeRequest] = useRequest();
  const popup = usePopup();

  const handleSave = async (attributes: CharacterAttributes) => {
    makeRequest(async () => {
      const updatedCharacter = await changeCharacterAttributes(attributes);
      if (updatedCharacter) {
        syncCharacter(updatedCharacter);
        popup.info({ message: 'Изменения сохранены' });
      }
    });
  };

  return {
    isPending,
    handleSave,
  };
};
