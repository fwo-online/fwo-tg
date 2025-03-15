import { useCharacter } from '@/contexts/character';
import { ButtonCell, Info, Navigation } from '@telegram-apps/telegram-ui';
import { use, type FC } from 'react';
import type { Magic } from '@fwo/schemas';
import { CharacterMagicModal } from './CharacterMagicModal';

export const CharacterMagicList: FC<{ magicsSource: Promise<Magic[]> }> = ({ magicsSource }) => {
  const { character } = useCharacter();
  const magics = use(magicsSource);

  return (
    <>
      {magics.map((magic) => (
        <CharacterMagicModal
          key={magic.name}
          magic={magic}
          trigger={
            <ButtonCell
              after={
                <Info style={{ marginLeft: 'auto' }} type="text">
                  {character.magics[magic.name]}
                </Info>
              }
            >
              <Navigation>{magic.displayName}</Navigation>
            </ButtonCell>
          }
        />
      ))}
    </>
  );
};
