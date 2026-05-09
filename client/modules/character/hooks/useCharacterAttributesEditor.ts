import { type CharacterAttributeKey, type CharacterAttributes, keys } from '@fwo/shared';
import { useMemo, useState } from 'react';

export const useCharacterAttributesEditor = (
  initialAttributes: CharacterAttributes,
  initialFree: number,
) => {
  const [attributes, setAttributes] = useState(initialAttributes);

  const spent = useMemo(() => {
    return keys(attributes).reduce(
      (acc, key) => acc + (attributes[key] - initialAttributes[key]),
      0,
    );
  }, [attributes, initialAttributes]);

  const free = initialFree - spent;

  const hasChanges = spent !== 0;

  const changeAttribute = (attribute: CharacterAttributeKey, delta: number) => {
    setAttributes((prev) => {
      const nextValue = prev[attribute] + delta;

      if (delta > 0 && free <= 0) {
        return prev;
      }

      if (nextValue < initialAttributes[attribute]) {
        return prev;
      }

      return {
        ...prev,
        [attribute]: nextValue,
      };
    });
  };

  const reset = () => {
    setAttributes(initialAttributes);
  };

  return {
    attributes,
    free,
    hasChanges,
    reset,
    increment: (attribute: keyof CharacterAttributes) => changeAttribute(attribute, 1),
    decrement: (attribute: keyof CharacterAttributes) => changeAttribute(attribute, -1),
  };
};
