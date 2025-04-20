import type { FC } from 'react';
import { Card } from '@/components/Card';
import { ItemsWearList } from '@/modules/items/components/ItemsWearList';
import { useNavigate } from 'react-router';

export const ClanForgePage: FC = () => {
  const navigate = useNavigate();

  const onClick = (wear: string) => {
    navigate(`/character/clan/forge/${wear}`);
  };

  return (
    <Card header="Клановая кузница" className="m-4!">
      <ItemsWearList onClick={onClick} />
    </Card>
  );
};
