import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useCharacter } from '@/contexts/character';
import { ClanList } from '@/modules/clan/components/ClanList';
import { useClans } from '@/modules/clan/hooks/useClans';
import type { Clan } from '@fwo/shared';
import { Suspense, type FC } from 'react';
import { Navigate, useNavigate } from 'react-router';

const ClanListLoader = () => {
  const { clans, isLoading, createRequest, cancelRequest } = useClans();
  const { character } = useCharacter();

  if (!clans.length) {
    return 'Кланов не найдено';
  }

  const isRequested = (clan: Clan) => {
    return clan.requests.includes(character.id);
  };

  return (
    <ClanList
      clans={clans}
      isLoading={isLoading}
      isRequested={isRequested}
      onCreateRequest={createRequest}
      onCancelRequest={cancelRequest}
    />
  );
};

export const ClanListPage: FC = () => {
  const navigate = useNavigate();
  const { character } = useCharacter();

  if (character.clan) {
    return <Navigate to="/clan" />;
  }

  return (
    <Card header="Кланы" className="m-4">
      <Suspense fallback={'Ищем кланы...'}>
        <ClanListLoader />

        <div className="flex flex-col">
          <Button className="mt-4" onClick={() => navigate('/character/clan/create')}>
            Создать клан
          </Button>
        </div>
      </Suspense>
    </Card>
  );
};
