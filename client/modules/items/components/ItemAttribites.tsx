import type { CharacterAttributes } from '@fwo/shared';
import classNames from 'classnames';
import type { FC } from 'react';

const attributes: (keyof CharacterAttributes)[] = ['str', 'dex', 'con', 'int', 'wis'];

const ItemAttribute: FC<{
  name: string;
  value: number;
  isRequired: boolean;
  showPlus: boolean;
}> = ({ name, value, isRequired, showPlus }) => {
  return (
    <div
      className={classNames('flex gap-1', {
        'text-red-700': isRequired,
      })}
    >
      <span>{name.toUpperCase()}</span>
      <span>
        {showPlus && value ? '+' : null}
        {value}
      </span>
    </div>
  );
};

export const ItemAttributes: FC<{
  itemAttributes: CharacterAttributes;
  characterAttributes?: CharacterAttributes;
}> = ({ itemAttributes, characterAttributes }) => {
  const checkRequirement = (attribute: keyof CharacterAttributes) => {
    if (characterAttributes) {
      return characterAttributes[attribute] < itemAttributes[attribute];
    }

    return false;
  };

  return (
    <div className="flex gap-4">
      {attributes.map((attribute) => (
        <ItemAttribute
          key={attribute}
          name={attribute}
          value={itemAttributes[attribute]}
          isRequired={checkRequirement(attribute)}
          showPlus={!characterAttributes}
        />
      ))}
    </div>
  );
};
