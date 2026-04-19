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

        <div className="flex flex-col">
          <Button className="mt-4" onClick={() => navigate('/character/clan/create')}>
            Создать клан
          </Button>
        </div>
      </Suspense>
    </Card>
  );
};

ClanListPage.loader = loader;
