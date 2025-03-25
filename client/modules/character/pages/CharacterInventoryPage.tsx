import type { FC } from 'react';
import { Card } from '@/components/Card';
import { CharacterInventoryList } from '../components/CharacterInventoryList';

export const CharacterInventoryPage: FC = () => {
  return (
    <Card header="Инвентарь" className="m-4!">
      <CharacterInventoryList />
    </Card>
  );
};
