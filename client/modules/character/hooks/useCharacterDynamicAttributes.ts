import { getCharacterDynamicAttributes } from '@/api/character';
import { useCharacter } from '@/modules/character/store/character';
import type { CharacterAttributes } from '@fwo/shared';
import { useEffect, useState, useTransition } from 'react';

export const useCharacterDynamicAttributes = (attributes: CharacterAttributes) => {
  const character = useCharacter();
  const [dynamicAttributes, setDynamicAttributes] = useState(
    structuredClone(character.dynamicAttributes),
  );
  const [loading, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const dynamicAttributes = await getCharacterDynamicAttributes(attributes);

      if (dynamicAttributes) {
        setDynamicAttributes(dynamicAttributes);
      }
    });
  }, [attributes]);

  return {
    loading,
    dynamicAttributes,
  };
};
