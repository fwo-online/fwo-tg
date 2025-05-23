import { changeCharacterAttributes } from '@/api/character';
import { usePopup } from '@/hooks/usePopup';
import { useRequest } from '@/hooks/useRequest';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { useCharacter } from '@/modules/character/store/character';
import type { CharacterAttributes } from '@fwo/shared';
import { useState } from 'react';

export const useCharacterAttributes = () => {
  const character = useCharacter();
  const { syncCharacter } = useSyncCharacter();
  const [free, setBonus] = useState(character.free);
  const [attributes, setAttributes] = useState(structuredClone(character.attributes));
  const hasChanges = free !== character.free;
  const [isPending, makeRequest] = useRequest();
  const popup = usePopup();

  const handleChangeAttribute = (attribute: keyof CharacterAttributes) => {
    setAttributes(() => {
      return structuredClone({
        ...attributes,
        [attribute]: attributes[attribute] + 1,
      });
    });
    setBonus(free - 1);
  };

  const handleReset = () => {
    setAttributes(structuredClone(character.attributes));
    setBonus(character.free);
  };

  const handleSave = async () => {
    makeRequest(async () => {
      const updatedCharacter = await changeCharacterAttributes(attributes);
      if (updatedCharacter) {
        syncCharacter(updatedCharacter);
        popup.info({ message: 'Изменения сохранены' });
      }
    });
  };

  return {
    hasChanges,
    attributes,
    free,
    isPending,
    handleReset,
    handleSave,
    handleChangeAttribute,
  };
};
