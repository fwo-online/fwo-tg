import type { CharacterPublic } from '@fwo/shared';
import { Suspense } from 'react';
import { Navigate, useLoaderData } from 'react-router';
import { getCharacterList } from '@/api/character';
import { getClan } from '@/api/clan';
import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';
import { Clan } from '@/modules/clan/components/Clan';
import { useClanStore } from '@/modules/clan/store/clan';

const loader = async () => {
  const clan = await getClan();
  const players = getCharacterList(clan.players);
  let requests: Promise<CharacterPublic[]>;

  if (clan.requests?.length) {
    requests = getCharacterList(clan.requests);
  } else {
    requests = Promise.resolve([]);
  }

  return {
    clan,
    players,
    requests,
  };
};

export const ClanPage = () => {
  const { clan, players, requests } = useLoaderData<typeof loader>();
  const setClan = useClanStore((state) => state.setClan);

  if (!clan) {
    return <Navigate to="/clan/list" />;
  }

  setClan(clan);

  return (
    <Card header={clan.name} className="m-4">
      <Suspense fallback={<Placeholder description="Загружаем клан..." />}>
        <Clan playersPromise={players} requestsPromise={requests} />
      </Suspense>
    </Card>
  );
};

ClanPage.loader = loader;
