import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import type { FC } from 'react';
import { useNavigate } from 'react-router';

export const AgoraPage: FC = () => {
  const navigate = useNavigate();

  const goToForge = () => {
    navigate('/agora/forge');
  };

  const goToServiceShop = () => {
    navigate('/agora/service');
  };
  return (
    <Card header="Рынок" className="m-4">
      <div className="flex flex-col gap-2">
        <Button onClick={goToForge}>Кузница</Button>
        <Button onClick={goToServiceShop}>Седой торговец</Button>
      </div>
    </Card>
  );
};
