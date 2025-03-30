import { getClanByID } from '@/api/clan';
import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';
import { useCharacter } from '@/contexts/character';
import { ClanComponent } from '@/modules/clan/components/Clan';
import { useClanGold } from '@/modules/clan/hooks/useClanGold';
import { useClanRequest } from '@/modules/clan/hooks/useClanRequest';
import type { FC } from 'react';
import { suspend } from 'suspend-react';

export const ClanPage: FC = () => {
  const { character } = useCharacter();
  const { isLoading, handleAddGold } = useClanGold();
  const { acceptRequest, rejectRequest } = useClanRequest();

  if (!character.clan) {
    return (
      <Card>
        <Placeholder description="Клан не найден" />
      </Card>
    );
  }

  const clan = suspend((id) => getClanByID(id), [character.clan]);
  const isOwner = clan.owner === character.id;

  return (
    <Card header={clan.name} className="m-4">
      <ClanComponent
        clan={clan}
        isOwner={isOwner}
        isLoading={isLoading}
        onAddGold={handleAddGold}
        onAcceptRequest={acceptRequest}
        onRejectRequest={rejectRequest}
      />
    </Card>
  );
};
