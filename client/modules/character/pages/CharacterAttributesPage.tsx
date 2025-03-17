import type { FC } from 'react';

import { CharacterAttributesEditor } from '@/modules/character/components/CharacterAttributesEditor';
import { useCharacterAttributes } from '@/modules/character/hooks/useCharacterAttributes';
import { useCharacterDynamicAttributes } from '@/modules/character/hooks/useCharacterDynamicAttributes';
import { CharacterAttributes } from '@/modules/character/components/CharacterDynamicAttributes';
import { Button } from '@/components/Button';

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
    <div className="flex flex-col gap-2 m-4!">
      <div className="flex gap-4">
        <span>Свободные очки</span>
        {free}
      </div>

      <CharacterAttributesEditor
        attributes={attributes}
        disabled={loading || !free}
        onChange={handleChangeAttribute}
      />

      <CharacterAttributes dynamicAttributes={dynamicAttributes} />
      <div className="flex gap-2">
        <Button className="flex-1" onClick={handleReset} disabled={!hasChanges || isPending}>
          Сбросить
        </Button>
        <Button className="flex-1" onClick={handleSave} disabled={!hasChanges || isPending}>
          Применить
        </Button>
      </div>
    </div>
  );
};
