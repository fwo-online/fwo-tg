import { changeCharacterAttributes } from '@/api/character';
import { useCharacter } from '@/contexts/character';
import { useRequest } from '@/hooks/useRequest';
import type { CharacterAttributes } from '@fwo/shared';
import { popup } from '@telegram-apps/sdk-react';
import { useState } from 'react';

export const useCharacterAttributes = () => {
  const { character, setCharacter } = useCharacter();
  const [free, setBonus] = useState(character.free);
  const [attributes, setAttributes] = useState(structuredClone(character.attributes));
  const hasChanges = free !== character.free;
  const [isPending, makeRequest] = useRequest();

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
        setCharacter(updatedCharacter);
        popup.open({ message: 'Изменения сохранены' });
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
