import { ItemsWearList } from '@/modules/items/components/ItemsWearList';
import type { FC } from 'react';
import { useNavigate } from 'react-router';

export const ForgeWearList: FC = () => {
  const navigate = useNavigate();

  const onClick = (wear: string) => {
    navigate(`/agora/forge/${wear}`);
  };

  return <ItemsWearList onClick={onClick} />;
};
