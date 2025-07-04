import type { CharacterAttributes } from '@fwo/shared';
import type { FC } from 'react';
import { Button } from '@/components/Button';

export const CharacterAttributesEditor: FC<{
  attributes: CharacterAttributes;
  disabled: boolean;
  onChange: (attribute: keyof CharacterAttributes) => void;
}> = ({ attributes, disabled, onChange }) => {
  // biome-ignore lint/nursery/noNestedComponentDefinitions: fixme
  const AttributeButton: FC<{ attribute: keyof CharacterAttributes }> = ({ attribute }) => {
    const handleClick = () => {
      if (disabled) {
        return;
      }

      onChange(attribute);
    };
    return (
      <Button
        className="flex flex-col justify-center items-center is-primary text-sm"
        onClick={handleClick}
      >
        {attribute.toUpperCase()}
        <span className="font-semibold"> {attributes[attribute].toString()}</span>
      </Button>
    );
  };

  return (
    <div className="flex justify-between gap-2">
      <AttributeButton attribute="str" />
      <AttributeButton attribute="dex" />
      <AttributeButton attribute="con" />
      <AttributeButton attribute="int" />
      <AttributeButton attribute="wis" />
    </div>
  );
};
