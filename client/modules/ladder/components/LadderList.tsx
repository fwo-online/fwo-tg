import { Card } from '@/components/Card';
import { useCharacter } from '@/modules/character/store/character';
import { LadderListItem } from '@/modules/ladder/components/LadderListItem';
import type { CharacterPublic } from '@fwo/shared';
import type { FC } from 'react';

export const LadderList: FC<{ ladderList: CharacterPublic[] }> = ({ ladderList }) => {
  const character = useCharacter();
  const characterPosition = ladderList.findIndex(({ id }) => character.id === id);

  return (
    <>
      <Card className="mb-4 mt-4 bg-(--tg-theme-bg-color)!">
        <LadderListItem character={character} position={characterPosition + 1} />
      </Card>
      <div className="flex flex-col gap-4 p-4">
        {ladderList.map((character, index) => (
          <LadderListItem
            className="pt-4 border-t-gray-500 border-t-2 "
            key={character.id}
            character={character}
            position={index + 1}
          />
        ))}
      </div>
    </>
  );
};
