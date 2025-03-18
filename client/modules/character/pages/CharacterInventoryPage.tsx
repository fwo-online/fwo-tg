import type { FC } from 'react';
import { useCharacter } from '@/contexts/character';
import { Card } from '@/components/Card';
import { CharacterInventoryList } from '../components/CharacterInventoryList';

export const CharacterInventoryPage: FC = () => {
  const { character } = useCharacter();

  return (
    <Card header="Инвентарь" className="m-4!">
      <CharacterInventoryList inventory={character.inventory} />
    </Card>
  );
};
