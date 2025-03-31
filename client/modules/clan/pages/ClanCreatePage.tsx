import { Card } from '@/components/Card';
import { ClanCreate } from '@/modules/clan/components/ClanCreate';
import { useClanCreate } from '@/modules/clan/hooks/useClanCreate';
import type { FC } from 'react';

export const ClanCreatePage: FC = () => {
  const { createClan } = useClanCreate();

  return (
    <Card header="Создание клана" className="m-4">
      <ClanCreate onCreate={createClan} />
    </Card>
  );
};
