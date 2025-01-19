import { getCharacterDynamicAttributes } from '@/client/character';
import { useCharacter } from '@/hooks/useCharacter';
import type { CharacterAttributes, CharacterDynamicAttributes } from '@fwo/schemas';
import { useActionState, useEffect } from 'react';

const updateCharacterDynamicAttributes = (
  _: CharacterDynamicAttributes,
  attributes: CharacterAttributes,
) => {
  return getCharacterDynamicAttributes(attributes);
};

export const useCharacterDynamicAttributes = (attributes: CharacterAttributes) => {
  const { character } = useCharacter();

  const [dynamicAttributes, updateDynamicAttributes, loading] = useActionState(
    updateCharacterDynamicAttributes,
    character.dynamicAttributes as CharacterDynamicAttributes,
  );

  useEffect(() => {
    updateDynamicAttributes(attributes);
  }, [attributes, updateDynamicAttributes]);

  return {
    loading,
    dynamicAttributes,
  };
};
