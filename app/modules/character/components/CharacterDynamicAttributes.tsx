import { Cell, List, Section } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';

import type { Attributes } from '@fwo/schemas';

export const CharacterAttributes: FC<{ dynamicAttributes: Attributes }> = ({
  dynamicAttributes,
}) => {
  return (
    <Section>
      <List>
        <Cell before="Урон" after={`${dynamicAttributes.hit.min} - ${dynamicAttributes.hit.max}`} />
        <Cell before="Атака" after={`${dynamicAttributes.phys.attack}`} />
        <Cell before="Защита" after={dynamicAttributes.phys.defence} />
        <Cell before="Здоровье" after={dynamicAttributes.base.hp} />
        <Cell
          before="Лечение"
          after={`${dynamicAttributes.heal.min} - ${dynamicAttributes.heal.max}`}
        />
        <Cell before="Мана" after={dynamicAttributes.base.mp} />
        <Cell before="Энергия" after={dynamicAttributes.base.en} />
        <Cell before=" Магическая атака" after={dynamicAttributes.magic.attack} />
        <Cell before=" Магическая защита" after={dynamicAttributes.magic.defence} />
      </List>
    </Section>
  );
};
