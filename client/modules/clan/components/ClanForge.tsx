import { Button } from '@/components/Button';
import type { FC } from 'react';
import { useClanOwner } from '@/modules/clan/hooks/useClanOwner';
import { useClanForge } from '@/modules/clan/hooks/useClanForge';
import { useNavigate } from 'react-router';
import { useClan } from '@/modules/clan/store/clan';

export const ClanForge: FC = () => {
  const isForgeActive = useClan((clan) => clan.forge.active);
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

  return <Button onClick={openForge}>Открыть кузницу</Button>;
};
