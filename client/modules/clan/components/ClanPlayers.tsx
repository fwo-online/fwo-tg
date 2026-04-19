import type { CharacterPublic } from '@fwo/shared';
import type { FC, ReactNode } from 'react';
import { Description } from '@/components/Description';
import { CharacterImage } from '@/modules/character/components/CharacterImage';

export const ClanPlayers: FC<{
  characters: CharacterPublic[];
  after?: (character: CharacterPublic) => ReactNode;
}> = ({ characters, after }) => {
  return (
    <Description>
      {characters.map((character) => (
        <Description.Item key={character.id} after={after?.(character)}>
          <div className="flex gap-2">
            <CharacterImage characterClass={character.class} small /> {character.name} (
            {character.lvl})
          </div>
        </Description.Item>
      ))}
    </Description>
  );
};
