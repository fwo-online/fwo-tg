import type { FC } from 'react';
import { Card } from '@/components/Card';
import { ItemsWearList } from '@/modules/items/components/ItemsWearList';
import { useNavigate } from 'react-router';

export const ForgePage: FC = () => {
  const navigate = useNavigate();

  const onClick = (wear: string) => {
    navigate(`/agora/forge/${wear}`);
  };

  return (
    <Card header="Кузница" className="m-4!">
      <h5 className="text-sm">
        Здесь ты можешь создать предметы. У предметов с уровня 2 появляется шанс неудачи при крафте.
        В клановой кузнице шанс успеха выше!
      </h5>
      <ItemsWearList onClick={onClick} />
    </Card>
  );
};
