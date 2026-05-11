import type { Clan } from '@fwo/shared';
import { Suspense } from 'react';
import { Navigate, useLoaderData, useNavigate } from 'react-router';
import { getClans } from '@/api/clan';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useCharacter } from '@/modules/character/store/character';
import { ClanList } from '@/modules/clan/components/ClanList';
import { useClans } from '@/modules/clan/hooks/useClans';

const loader = async () => {
  const clans = await getClans();

  return {
    clans,
  };
};

export const ClanListPage = () => {
  const navigate = useNavigate();
  const character = useCharacter();
  const { clans } = useLoaderData<typeof loader>();
  const { isLoading, createRequest, cancelRequest } = useClans();

  if (character.clan) {
    return <Navigate to="/clan" />;
  }

  const isRequested = (clan: Clan) => {
    return clan.requests.includes(character.id);
  };

  return (
    <div className="h-screen flex flex-col justify-between">
      <Card header="Кланы" className="m-4">
        <Suspense fallback={'Ищем кланы...'}>
          {clans.length ? (
            <ClanList
              clans={clans}
              isLoading={isLoading}
              isRequested={isRequested}
              onCreateRequest={createRequest}
              onCancelRequest={cancelRequest}
            />
          ) : (
            'Кланов не найдено'
          )}
        </Suspense>
      </Card>

      <div className="flex flex-col p-4">
        <Button className="mt-4 is-primary" onClick={() => navigate('/character/clan/create')}>
          Создать клан
        </Button>
      </div>
    </div>
  );
};

ClanListPage.loader = loader;
