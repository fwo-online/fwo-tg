import { getClanByID } from '@/api/clan';
import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';
import { useCharacter } from '@/contexts/character';
import { useUnmountEffect } from '@/hooks/useUnmountEffect';
import { Clan } from '@/modules/clan/components/Clan';
import { ClanProvider } from '@/modules/clan/contexts/useClan';
import type { ClanPublic } from '@fwo/shared';
import { Suspense, type FC } from 'react';
import { Navigate } from 'react-router';
import { clear, suspend } from 'suspend-react';

const ClanLoader: FC<{ clan: ClanPublic }> = ({ clan }) => {
  useUnmountEffect(() => {
    clear([clan.id]);
  });

  const loadedClan = suspend(async (id) => getClanByID(id), [clan.id]);

  return (
    <ClanProvider clan={loadedClan}>
      <Clan />
    </ClanProvider>
  );
};

export const ClanPage: FC = () => {
  const { character } = useCharacter();

  if (!character.clan) {
    return <Navigate to="/clan/list" />;
  }

  return (
    <Card header={character.clan.name} className="m-4">
      <Suspense fallback={<Placeholder description="Загружаем клан..." />}>
        <ClanLoader clan={character.clan} />
      </Suspense>
    </Card>
  );
};
