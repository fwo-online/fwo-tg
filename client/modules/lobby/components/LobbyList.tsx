import { Placeholder } from '@/components/Placeholder';
import type { FC } from 'react';
import { reservedClanName, type CharacterPublic } from '@fwo/shared';
import { groupBy } from 'es-toolkit';
import { Description } from '@/components/Description';
import { CharacterImage } from '@/modules/character/components/CharacterImage';

export const LobbyList: FC<{ searchers: CharacterPublic[] }> = ({ searchers }) => {
  const searchersByClan = groupBy(searchers, ({ clan }) => clan?.name ?? reservedClanName);

  return (
    <>
      {searchers.length ? (
        Object.entries(searchersByClan).map(([clan, searchers]) => (
          <Description key={clan} header={clan === reservedClanName ? 'Без клана' : clan}>
            {searchers?.map((searcher) => (
              <Description.Item key={searcher.id}>
                <div className="flex">
                  <CharacterImage characterClass={searcher.class} small /> {searcher.name}
                </div>
              </Description.Item>
            ))}
          </Description>
        ))
      ) : (
        <Placeholder description="Никого нет" />
      )}
    </>
  );
};
