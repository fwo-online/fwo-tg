import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';
import { useCharacter } from '@/contexts/character';
import { ClanComponent } from '@/modules/clan/components/Clan';
import type { FC } from 'react';

export const ClanPage: FC = () => {
  const { character } = useCharacter();

  return (
    <Card header="Кланы" className="m-4">
      {character.clan ? (
        <ClanComponent clan={character.clan} />
      ) : (
        <Placeholder description="Клан не найден" />
      )}
    </Card>
  );
};
