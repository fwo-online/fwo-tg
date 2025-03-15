import { getCharacterDynamicAttributes } from '@/client/character';
import { useCharacter } from '@/contexts/character';
import type { CharacterAttributes } from '@fwo/schemas';
import { useEffect, useState, useTransition } from 'react';

export const useCharacterDynamicAttributes = (attributes: CharacterAttributes) => {
  const { character } = useCharacter();
  const [dynamicAttributes, setDynamicAttributes] = useState(character.dynamicAttributes);
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
