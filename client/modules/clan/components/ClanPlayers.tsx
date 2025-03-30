import { getCharacterList } from '@/api/character';
import { Description } from '@/components/Description';
import { characterClassNameMap } from '@/constants/character';
import type { CharacterPublic } from '@fwo/shared';
import type { FC, ReactNode } from 'react';
import { suspend } from 'suspend-react';

export const ClanPlayers: FC<{
  players: string[];
  after?: (character: CharacterPublic) => ReactNode;
}> = ({ players, after }) => {
  const characters = suspend((...players) => getCharacterList(players), players);

  return (
    <Description>
      {characters.map((character) => (
        <Description.Item key={character.id} after={after?.(character)}>
          {character.name} ({characterClassNameMap[character.class]} {character.lvl})
        </Description.Item>
      ))}
    </Description>
  );
};
