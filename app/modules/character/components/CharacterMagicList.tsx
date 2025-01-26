import { useCharacter } from '@/hooks/useCharacter';
import { ButtonCell, Info, Navigation } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import type { Magic } from '@fwo/schemas';
import { CharacterMagicModal } from './CharacterMagicModal';

export const CharacterMagicList: FC<{ magics: Magic[] }> = ({ magics }) => {
  const { character } = useCharacter();

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
