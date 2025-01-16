import { changeCharacterAttributes } from '@/client/character';
import { useCharacter } from '@/hooks/useCharacter';
import type { CharacterAttributes } from '@fwo/schemas';
import { useState } from 'react';

export const useCharacterAttributes = () => {
  const { character, setCharacter } = useCharacter();
  const [free, setBonus] = useState(character.free);
  const [attributes, setAttributes] = useState(structuredClone(character.attributes));

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
    const updatedCharacter = await changeCharacterAttributes(attributes);
    if (updatedCharacter) {
      setCharacter(updatedCharacter);
    }
  };

  return {
    attributes,
    free,
    handleReset,
    handleSave,
    handleChangeAttribute,
  };
};
