import { type CharacterPublic, reservedClanName } from '@fwo/shared';
import { groupBy } from 'es-toolkit';
import type { FC } from 'react';
import { Description } from '@/components/Description';
import { Placeholder } from '@/components/Placeholder';
import { Player } from '@/components/Player';

export const LobbyList: FC<{ searchers: CharacterPublic[] }> = ({ searchers }) => {
  const searchersByClan = groupBy(searchers, ({ clan }) => clan?.name ?? reservedClanName);

  return (
    <>
      {searchers.length ? (
        Object.entries(searchersByClan).map(([clan, searchers]) => (
          <Description key={clan} header={clan === reservedClanName ? 'Без клана' : clan}>
            {searchers?.map((searcher) => (
              <Description.Item key={searcher.id}>
                <Player class={searcher.class} name={searcher.name} lvl={searcher.lvl} />
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
