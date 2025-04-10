import { LadderListItem } from '@/modules/ladder/components/LadderListItem';
import type { CharacterPublic } from '@fwo/shared';
import type { FC } from 'react';

export const LadderList: FC<{ ladderList: CharacterPublic[] }> = ({ ladderList }) => {
  console.log(ladderList);

  return (
    <div className="flex flex-col gap-4">
      {ladderList.map((character, index) => (
        <LadderListItem key={character.id} character={character} position={index + 1} />
      ))}
    </div>
  );
};
