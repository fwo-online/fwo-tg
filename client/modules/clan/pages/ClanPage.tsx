import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';
import { useCharacter } from '@/modules/character/store/character';
import { Clan } from '@/modules/clan/components/Clan';
import { useSyncClan } from '@/modules/clan/hooks/useSyncClan';
import { Suspense, type FC } from 'react';
import { Navigate } from 'react-router';

const ClanLoader = () => {
  useSyncClan();

  return <Clan />;
};

export const ClanPage: FC = () => {
  const clan = useCharacter((character) => character.clan);

  if (!clan) {
    return <Navigate to="/clan/list" />;
  }

  return (
    <Card header={clan.name} className="m-4">
      <Suspense fallback={<Placeholder description="Загружаем клан..." />}>
        <ClanLoader />
      </Suspense>
    </Card>
  );
};
