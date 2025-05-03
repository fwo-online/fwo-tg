import type { FC } from 'react';
import type { Magic } from '@fwo/shared';
import { Button } from '@/components/Button';
import { useCharacter } from '@/modules/character/store/character';
import { CharacterMagicModal } from '@/modules/character/components/CharacterMagicModal';

export const CharacterMagicList: FC<{ magics: Magic[] }> = ({ magics }) => {
  const character = useCharacter();

  return (
    <div className="flex flex-col gap-2">
      {magics.map((magic) => (
        <CharacterMagicModal
          key={magic.name}
          magic={magic}
          trigger={
            <Button className="flex justify-between">
              <span>{magic.displayName}</span>
              <span className="opacity-50">{character.magics[magic.name]}</span>
            </Button>
          }
        />
      ))}
    </div>
  );
};
