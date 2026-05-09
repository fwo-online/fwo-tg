import type { CharacterAttributeKey, CharacterAttributes } from '@fwo/shared';
import type { FC } from 'react';
import { CharacterAttributeButton } from '@/modules/character/components/CharacterAttributeButton';

const ATTRIBUTES_MAP: Record<CharacterAttributeKey, { label: string }> = {
  str: {
    label: 'STR',
  },
  dex: {
    label: 'DEX',
  },
  con: {
    label: 'CON',
  },
  int: {
    label: 'INT',
  },
  wis: {
    label: 'WIS',
  },
};

const ATTRIBUTES_KEYS: CharacterAttributeKey[] = ['str', 'dex', 'con', 'int', 'wis'];

export const CharacterAttributesEditor: FC<{
  baseAttributes: CharacterAttributes;
  attributes: CharacterAttributes;
  disabled: boolean;
  free: number;
  onIncrease: (attribute: keyof CharacterAttributes) => void;
  onDecrease: (attribute: keyof CharacterAttributes) => void;
}> = ({ baseAttributes, attributes, free, disabled, onIncrease, onDecrease }) => {
  return (
    <div className="flex justify-between gap-0">
      {ATTRIBUTES_KEYS.map((attribute) => {
        const value = attributes[attribute];

        const canIncrease = !disabled && free > 0;

        const canDecrease = !disabled && value > baseAttributes[attribute];

        return (
          <CharacterAttributeButton
            key={attribute}
            label={ATTRIBUTES_MAP[attribute].label}
            value={attributes[attribute]}
            canIncrease={canIncrease}
            canDecrease={canDecrease}
            onIncrease={() => onIncrease(attribute)}
            onDecrease={() => onDecrease(attribute)}
          />
        );
      })}
    </div>
  );
};
