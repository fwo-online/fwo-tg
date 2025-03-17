import type { FC } from 'react';
import { Navigate, useParams } from 'react-router';
import { wearListTranslations } from '@/constants/inventory';
import { CharacterInventoryList } from '../components/CharacterInventoryList';
import { useCharacter } from '@/contexts/character';
import { validateWear } from '@/utils/inventory';
import { Card } from '@/components/Card';

export const CharacterInventoryListPage: FC = () => {
  const { wear } = useParams();
  const { character } = useCharacter();

  if (!validateWear(wear)) {
    return <Navigate to="/error" />;
  }

  const inventory = character.inventory?.filter((item) => item.wear === wear);

  return (
    <Card header={wearListTranslations[wear]} className="m-4!">
      <CharacterInventoryList inventory={inventory} />
    </Card>
  );
};
