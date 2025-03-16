import type { CharacterAttributes } from '@fwo/shared';
import { InlineButtons, Section } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';

export const CharacterAttributesEditor: FC<{
  attributes: CharacterAttributes;
  disabled: boolean;
  onChange: (attribute: keyof CharacterAttributes) => void;
}> = ({ attributes, disabled, onChange }) => {
  const AttributeButton: FC<{ attribute: keyof CharacterAttributes }> = ({ attribute }) => {
    const handleClick = () => {
      if (disabled) {
        return;
      }

      onChange(attribute);
    };
    return (
      <InlineButtons.Item text={attributes[attribute].toString()} onClick={handleClick}>
        {attribute.toUpperCase()}
      </InlineButtons.Item>
    );
  };

  return (
    <Section>
      <InlineButtons style={{ gap: 0 }}>
        <AttributeButton attribute="str" />
        <AttributeButton attribute="dex" />
        <AttributeButton attribute="con" />
        <AttributeButton attribute="int" />
        <AttributeButton attribute="wis" />
      </InlineButtons>
    </Section>
  );
};
