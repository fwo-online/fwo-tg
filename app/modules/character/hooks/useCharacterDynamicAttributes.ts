import { getCharacterDynamicAttributes } from '@/client/character';
import { useCharacter } from '@/contexts/character';
import type { CharacterAttributes } from '@fwo/schemas';
import { useEffect, useState } from 'react';

export const useCharacterDynamicAttributes = (attributes: CharacterAttributes) => {
  const { character } = useCharacter();
  const [dynamicAttributes, setDynamicAttributes] = useState(character.dynamicAttributes);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCharacterDynamicAttributes(attributes)
      .then((dynamicAttributes) => {
        if (dynamicAttributes) {
          setDynamicAttributes(dynamicAttributes);
        }
      })
      .finally(() => setLoading(false));
  }, [attributes]);

  return {
    loading,
    dynamicAttributes,
  };
};
