import type { FC } from 'react';
import { ForgeWearList } from '@/modules/forge/components/ForgeWearList';
import { Card } from '@/components/Card';

export const ForgePage: FC = () => {
  return (
    <Card header="Кузница" className="m-4!">
      <ForgeWearList />
    </Card>
  );
};
