import { Section } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';

import { CharacterClass, type Attributes } from '@fwo/schemas';
import { Description } from '@/components/Description';
import { useCharacter } from '@/contexts/character';

export const CharacterAttributes: FC<{ dynamicAttributes: Attributes }> = ({
  dynamicAttributes,
}) => {
  const { character } = useCharacter();
  return (
    <Section>
      <Description>
        <Description.Item after={`${dynamicAttributes.hit.min} - ${dynamicAttributes.hit.max}`}>
          Урон
        </Description.Item>
        <Description.Item after={`${dynamicAttributes.phys.attack}`}>Атака</Description.Item>
        <Description.Item after={dynamicAttributes.phys.defence}>Защита</Description.Item>
        <Description.Item after={dynamicAttributes.base.hp}>Здоровье</Description.Item>
        <Description.Item after={`${dynamicAttributes.heal.min} - ${dynamicAttributes.heal.max}`}>
          Лечение
        </Description.Item>
        <Description.Item after={dynamicAttributes.base.mp}>Мана</Description.Item>
        <Description.Item after={dynamicAttributes.regen.mp}>Восстановление маны</Description.Item>
        <Description.Item after={dynamicAttributes.base.en}>Энергия</Description.Item>
        <Description.Item after={dynamicAttributes.regen.en}>
          Восстановление энергии
        </Description.Item>
        <Description.Item after={dynamicAttributes.magic.attack}>Магическая атака</Description.Item>
        <Description.Item after={dynamicAttributes.magic.defence}>
          Магическая защита
        </Description.Item>
        {character.class === CharacterClass.Archer && (
          <Description.Item after={dynamicAttributes.maxTarget}>
            Количество целей для атаки
          </Description.Item>
        )}
        {(character.class === CharacterClass.Mage || character.class === CharacterClass.Priest) && (
          <Description.Item after={dynamicAttributes.spellLength}>
            Длительность магии
          </Description.Item>
        )}
      </Description>
    </Section>
  );
};
