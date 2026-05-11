import type { FC } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CharacterAttributesEditor } from '@/modules/character/components/CharacterAttributesEditor';
import { CharacterAttributes } from '@/modules/character/components/CharacterDynamicAttributes';
import { useCharacterAttributes } from '@/modules/character/hooks/useCharacterAttributes';
import { useCharacterAttributesEditor } from '@/modules/character/hooks/useCharacterAttributesEditor';
import { useCharacterDynamicAttributes } from '@/modules/character/hooks/useCharacterDynamicAttributes';
import { useCharacter } from '@/modules/character/store/character';

export const CharacterAttributesPage: FC = () => {
  const attributes = useCharacter((character) => character.attributes);
  const free = useCharacter((character) => character.free);
  const baseDynamicAttributes = useCharacter((character) => character.dynamicAttributes);
  const characterClass = useCharacter((character) => character.class);
  const editor = useCharacterAttributesEditor(attributes, free);
  const { dynamicAttributes, loading } = useCharacterDynamicAttributes(editor.attributes);
  const { isPending, handleSave } = useCharacterAttributes();

  return (
    <div className="h-screen flex flex-col">
      <Card header="Характеристики" className="flex-1 m-4 mb-1">
        <CharacterAttributes
          baseDynamicAttributes={baseDynamicAttributes}
          dynamicAttributes={dynamicAttributes}
          characterClass={characterClass}
        />
      </Card>

      <Card className="m-4 mt-0 flex-0 flex flex-col">
        <div className="flex gap-2 font-bold">
          <span>Свободные очки:</span>
          {editor.free}
        </div>

        <CharacterAttributesEditor
          baseAttributes={attributes}
          free={editor.free}
          attributes={editor.attributes}
          disabled={loading || !free}
          onIncrease={editor.increment}
          onDecrease={editor.decrement}
        />

        <div className="flex gap-2 mt-4">
          <Button
            className="flex-1"
            onClick={editor.reset}
            disabled={!editor.hasChanges || isPending}
          >
            Сбросить
          </Button>
          <Button
            className="flex-1 is-primary"
            onClick={() => handleSave(editor.attributes)}
            disabled={!editor.hasChanges || isPending}
          >
            Применить
          </Button>
        </div>
      </Card>
    </div>
  );
};
