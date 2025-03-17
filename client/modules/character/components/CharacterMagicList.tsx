import { useCharacter } from '@/contexts/character';
import { ButtonCell, Info, Navigation } from '@telegram-apps/telegram-ui';
import { use, type FC } from 'react';
import type { Magic } from '@fwo/shared';
import { CharacterMagicModal } from './CharacterMagicModal';
import { Button } from '@/components/Button';

export const CharacterMagicList: FC<{ magicsSource: Promise<Magic[]> }> = ({ magicsSource }) => {
  const { character } = useCharacter();
  const magics = use(magicsSource);

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
