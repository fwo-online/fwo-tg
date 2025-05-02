import { Button } from '@/components/Button';

import type { FC } from 'react';
import { useClanStore } from '@/modules/clan/contexts/useClan';
import { useClanOwner } from '@/modules/clan/hooks/useClanOwner';
import { useClanForge } from '@/modules/clan/hooks/useClanForge';
import { useNavigate } from 'react-router';

export const ClanForge: FC = () => {
  const loading = useClanStore((state) => state.loading);
  const isForgeActive = useClanStore((state) => state.clan.forge.active);
  const { openForge } = useClanForge();
  const { isOwner } = useClanOwner();
  const navigate = useNavigate();

  if (isForgeActive) {
    return <Button onClick={() => navigate('/character/clan/forge')}>Перейти в кузницу</Button>;
  }

  if (!isOwner) {
    return (
      <Button disabled onClick={() => navigate('/character/clan/forge')}>
        Перейти в кузницу
      </Button>
    );
  }

  return (
    <Button disabled={loading} onClick={openForge}>
      Открыть кузницу
    </Button>
  );
};
