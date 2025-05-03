import type { FC } from 'react';
import { CharacterClass, type Attributes } from '@fwo/shared';
import { Description } from '@/components/Description';
import { useCharacter } from '@/modules/character/store/character';

export const CharacterAttributes: FC<{ dynamicAttributes: Attributes }> = ({
  dynamicAttributes,
}) => {
  const characterClass = useCharacter((character) => character.class);

  return (
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
      <Description.Item after={dynamicAttributes.regen.en}>Восстановление энергии</Description.Item>
      <Description.Item after={dynamicAttributes.magic.attack}>Магическая атака</Description.Item>
      <Description.Item after={dynamicAttributes.magic.defence}>Магическая защита</Description.Item>
      {characterClass === CharacterClass.Archer && (
        <Description.Item after={dynamicAttributes.maxTarget}>
          Количество целей для атаки
        </Description.Item>
      )}
      {(characterClass === CharacterClass.Mage || characterClass === CharacterClass.Priest) && (
        <Description.Item after={dynamicAttributes.spellLength}>
          Длительность магии
        </Description.Item>
      )}
    </Description>
  );
};
