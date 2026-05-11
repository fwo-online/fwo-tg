import { type Attributes, CharacterClass } from '@fwo/shared';
import type { FC } from 'react';
import { Description } from '@/components/Description';
import { RangeStatValue, StatValue } from '@/components/StatValue';

export const CharacterAttributes: FC<{
  baseDynamicAttributes: Attributes;
  dynamicAttributes: Attributes;
  characterClass: CharacterClass;
}> = ({ baseDynamicAttributes, dynamicAttributes, characterClass }) => {
  return (
    <Description>
      <Description.Item
        after={<RangeStatValue value={dynamicAttributes.hit} base={baseDynamicAttributes.hit} />}
      >
        Урон
      </Description.Item>
      <Description.Item
        after={
          <StatValue
            value={dynamicAttributes.phys.attack}
            base={baseDynamicAttributes.phys.attack}
          />
        }
      >
        Атака
      </Description.Item>
      <Description.Item
        after={
          <StatValue
            value={dynamicAttributes.phys.defence}
            base={baseDynamicAttributes.phys.defence}
          />
        }
      >
        Защита
      </Description.Item>
      <Description.Item
        after={<StatValue value={dynamicAttributes.base.hp} base={baseDynamicAttributes.base.hp} />}
      >
        Здоровье
      </Description.Item>
      <Description.Item
        after={<RangeStatValue value={dynamicAttributes.heal} base={baseDynamicAttributes.heal} />}
      >
        Лечение
      </Description.Item>
      <Description.Item
        after={<StatValue value={dynamicAttributes.base.mp} base={baseDynamicAttributes.base.mp} />}
      >
        Мана
      </Description.Item>
      <Description.Item
        after={
          <StatValue value={dynamicAttributes.regen.mp} base={baseDynamicAttributes.regen.mp} />
        }
      >
        Восстановление маны
      </Description.Item>
      <Description.Item
        after={<StatValue value={dynamicAttributes.base.en} base={baseDynamicAttributes.base.en} />}
      >
        Энергия
      </Description.Item>
      <Description.Item
        after={
          <StatValue value={dynamicAttributes.regen.en} base={baseDynamicAttributes.regen.en} />
        }
      >
        Восстановление энергии
      </Description.Item>
      <Description.Item
        after={
          <StatValue
            value={dynamicAttributes.magic.attack}
            base={baseDynamicAttributes.magic.attack}
          />
        }
      >
        Магическая атака
      </Description.Item>
      <Description.Item
        after={
          <StatValue
            value={dynamicAttributes.magic.defence}
            base={baseDynamicAttributes.magic.defence}
          />
        }
      >
        Магическая защита
      </Description.Item>
      {characterClass === CharacterClass.Archer && dynamicAttributes.maxTarget && (
        <Description.Item
          after={
            <StatValue value={dynamicAttributes.maxTarget} base={baseDynamicAttributes.maxTarget} />
          }
        >
          Количество целей для атаки
        </Description.Item>
      )}
      {(characterClass === CharacterClass.Mage || characterClass === CharacterClass.Priest) &&
        dynamicAttributes.spellLength && (
          <Description.Item
            after={
              <StatValue
                value={dynamicAttributes.spellLength}
                base={baseDynamicAttributes.spellLength}
              />
            }
          >
            Длительность магии
          </Description.Item>
        )}
    </Description>
  );
};
