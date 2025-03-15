import { Button, Cell, List } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';

import { CharacterAttributesEditor } from '@/modules/character/components/CharacterAttributesEditor';
import { useCharacterAttributes } from '@/modules/character/hooks/useCharacterAttributes';
import { useCharacterDynamicAttributes } from '@/modules/character/hooks/useCharacterDynamicAttributes';
import { CharacterAttributes } from '@/modules/character/components/CharacterDynamicAttributes';

export const CharacterAttributesPage: FC = () => {
  const {
    attributes,
    free,
    isPending,
    hasChanges,
    handleSave,
    handleChangeAttribute,
    handleReset,
  } = useCharacterAttributes();
  const { dynamicAttributes, loading } = useCharacterDynamicAttributes(attributes);

  return (
    <List>
      <Cell subhead="Свободные очки">{free}</Cell>
      <CharacterAttributesEditor
        attributes={attributes}
        disabled={loading || !free}
        onChange={handleChangeAttribute}
      />

      <CharacterAttributes dynamicAttributes={dynamicAttributes} />
      <Button stretched onClick={handleReset} disabled={!hasChanges || isPending}>
        Сбросить
      </Button>
      <Button
        stretched
        onClick={handleSave}
        disabled={!hasChanges || isPending}
        loading={isPending}
      >
        Применить
      </Button>
    </List>
  );
};
