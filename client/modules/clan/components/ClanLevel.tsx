import { Button } from '@/components/Button';

import type { FC } from 'react';
import { useClanStore } from '@/modules/clan/contexts/useClan';
import { useClanOwner } from '@/modules/clan/hooks/useClanOwner';
import { useClanLvl } from '@/modules/clan/hooks/useClanLvl';

export const ClanLevel: FC = () => {
  const clan = useClanStore((state) => state.clan);
  const loading = useClanStore((state) => state.loading);
  const { upgradeLvl } = useClanLvl();
  const { isOwner } = useClanOwner();

  if (!isOwner) {
    return null;
  }

  return (
    <Button disabled={loading} onClick={() => upgradeLvl(clan)}>
      Повысить уровень
    </Button>
  );
};
